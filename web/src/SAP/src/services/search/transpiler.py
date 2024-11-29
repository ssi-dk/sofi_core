from .visitor import on, when
import re
import sys
from datetime import datetime, timedelta
from ....common.config.column_config import pii_columns
from ....generated.models.query_expression import (
    QueryExpression,
    QueryOperand,
    QueryOperator,
    Model,
)


IMPLICIT_OP = "$and"
IMPLICIT_FIELD = "sequence_id"


def structure_operator(operator, left, right):
    if operator == QueryOperator.AND:
        return {"$and": [left, right]}
    elif operator == QueryOperator.OR:
        return {"$or": [left, right]}
    elif operator == QueryOperator._IMPLICIT_:
        return {IMPLICIT_OP: [left, right]}


def check_for_wildcard(field: str, termm: str):
    # pii columns are encrypted and have to be searched on exact matches --
    # skip any alteration of the term or syntax tree
    if field in pii_columns():
        return termm
    term = f"{termm}"
    # Do not treat escaped asterisk '\*' as a wildcard
    termIgnoreEscaped = term.replace("\\*", "★")
    if "*" in termIgnoreEscaped:
        terms = [x.replace("★", "*") for x in termIgnoreEscaped.split("*") if x != ""]
        escaped = list(map(re.escape, terms))
        # since regex matches on anything within the value, we do not need to put in the wildcard
        # if we do need to, we can reenable this and perhaps pin with ^ or $
        # regex_pattern = ''.join([x if x != "" else ".*" for x in escaped])
        regex_pattern = "".join(escaped)
        return {"$regex": regex_pattern, "$options": "i"}

    escaped = re.escape(termIgnoreEscaped.replace("★", "*"))
    search = "^" + escaped + "$"
    return {"$regex": search, "$options": "i"}


def coerce_term(term: str):
    if term == "true":
        return True
    if term == "false":
        return False
    try:
        try:
            return int(term)
        except Exception:
            pass
        try:
            return float(term)
        except Exception:
            pass
        try:
            return datetime.fromisoformat(term)
        except Exception:
            raise
    except Exception:
        return term


def structure_wildcard(field, node):
    if field in pii_columns():
        if field == "cpr_nr":   # because cpr is saved as a string in the DB, so don't convert even when consists of only digits
            return node.term
        return coerce_term(node.term)
    coerced = coerce_term(node.term)
    if isinstance(coerced, str):
        return check_for_wildcard(field, coerced)
    elif isinstance(coerced, datetime):
        return {"$gte": coerced, "$lte": coerced + timedelta(days=1)}
    else:
        return {"$in": [coerced, node.term]}


def is_date_string(value):
    try:
        datetime.fromisoformat(value)
        return True
    except ValueError:
        return False
    
def is_float_string(value):
    try:
        float(value)
        return True
    except ValueError:
        return False
    
def convert_type(value):
    if value.isdigit():
        return int(value)
    elif is_float_string(value):
        return float(value)
    elif value.isdigit():
        return int(value)
    elif is_date_string(value):
        return datetime.fromisoformat(value)
    return value


def structure_ranged(field, node):
    min_op = "$gte" if node.inclusive == "left" or node.inclusive == "both" else "$gt"
    max_op = "$lte" if node.inclusive == "right" or node.inclusive == "both" else "$lt"
    #if the hours, minutes and seconds are not in the search like this 2022-04-08T09:01:07 it is assumed that the entire day is intended to be included
    #default with the specific time of day not specified it is as if they are 00, which would exclude all records from during that day, which is not the behavior we expect is wanted   
    max_term = convert_type(node.term_max)
    if type(max_term) == datetime and max_op =="$lte" and max_term.hour == 0 and max_term.minute == 0 and max_term.second == 0:
        max_term = max_term + timedelta(days = 1 ) - timedelta(seconds = 1)

    if node.term_min == "*":
        return {max_op: max_term}
    if node.term_max == "*":
        return {min_op: convert_type(node.term_min)}
    
    return {min_op: convert_type(node.term_min), max_op: max_term}


def structure_leaf(node, is_negated):
    field = node.field if node.field != "<implicit>" else IMPLICIT_FIELD
    dispatch = structure_wildcard
    # presence of inclusivity denotes a range-based query
    if node.inclusive:
        dispatch = structure_ranged
    res = dispatch(field, node)
    print("leaf node:", res, file=sys.stderr, flush=True)
    if is_negated:
        return {field: {"$not": res}}
    else:
        return {field: res}


def is_negated_op(node):
    operator = node.operator
    if operator == QueryOperator.AND_NOT:
        return QueryOperator.AND, True
    elif operator == QueryOperator.OR_NOT:
        return QueryOperator.OR, True
    else:
        return operator, False


def de_morgan_law(operator):
    if operator == QueryOperator.AND:
        return QueryOperator.AND
    elif operator == QueryOperator.OR:
        return QueryOperator.OR
    elif operator == QueryOperator.AND_NOT:
        return QueryOperator.OR
    elif operator == QueryOperator.OR_NOT:
        return QueryOperator.AND
    elif operator == QueryOperator._IMPLICIT_:
        return QueryOperator._IMPLICIT_


class AbstractSyntaxTreeVisitor(object):
    @on("node")
    def visit(self, node):
        """
        This is the generic method that initializes the
        dynamic dispatcher.
        """

    @when(Model)
    def visit(self, node):
        """
        Will run for nodes that do specifically match the
        provided type.
        """
        print("Unrecognized node:", node)

    @when(QueryExpression)
    def visit(self, node: QueryExpression):
        operator, is_negated = is_negated_op(node)
        if node.operator == None:
            is_negated = is_negated or (
                node.left is not None
                and node.left.prefix is not None
                and "-" in node.left.prefix
            )
            return structure_leaf(node.left, is_negated)
        # The right node would be negated in any of the AND NOT or OR NOT operators
        return structure_operator(
            operator, node.left.accept(self), node.right.accept(self, is_negated)
        )

    @when(QueryOperand)
    def visit(self, node: QueryOperand, is_negated: bool = False):
        if node.operator is not None:
            operator, is_negated_operator = is_negated_op(node)
            is_negated = is_negated or is_negated_operator
            if is_negated:
                operator = de_morgan_law(node.operator)
            # Because of the openapi generator, there is a problem with nested expressions, e.g. "amr_amp: Sensitiv AND NOT (isolate_id: 1 OR isolate_id: 3)"
            # we need to manually reparse the models
            left = (
                QueryOperand.from_dict(node.left)
                if isinstance(node.left, dict)
                else node.left
            )
            right = (
                QueryOperand.from_dict(node.right)
                if isinstance(node.right, dict)
                else node.right
            )
            return structure_operator(
                operator, left.accept(self, is_negated), right.accept(self, is_negated)
            )
        elif node.field and (node.term or node.inclusive):  # presence of inclusivity denotes a range-based query
            is_negated = is_negated or (node.prefix is not None and "-" in node.prefix)
            return structure_leaf(node, is_negated)
