from .visitor import on, when
import re
import sys

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


def check_for_wildcard(termm: str):
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
            raise
    except Exception:
        return term


def structure_leaf(node, is_negated):
    field = node.field if node.field != "<implicit>" else IMPLICIT_FIELD
    coerced = coerce_term(node.term)
    if is_negated:
        if isinstance(coerced, str):
            return {field: {"$not": check_for_wildcard(coerced)}}
        else:
            return {field: {"$ne": coerced}}
    else:
        if isinstance(coerced, str):
            res = {field: check_for_wildcard(coerced)}
            return res
        else:
            return {field: coerced}


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
        elif node.field and node.term:
            is_negated = is_negated or (node.prefix is not None and "-" in node.prefix)
            return structure_leaf(node, is_negated)
