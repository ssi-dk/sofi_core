from .visitor import on, when

from ....generated.models.query_expression import (
    QueryExpression,
    QueryOperand,
    QueryOperator,
    Model,
)


def structure_not(right):
    # (rfield, rval) = right
    # return { rfield: { "$not": { "$eq": rval } } }
    return right


def structure_operator(operator, left, right):
    if operator == QueryOperator.AND:
        return {"$and": [left, right]}
    elif operator == QueryOperator.OR:
        return {"$or": [left, right]}
    elif operator == QueryOperator._IMPLICIT_:
        return {"$and": [left, right]}


def is_negated_op(node: QueryOperand):
    res = (
        node.operator and "NOT" in node.operator
    )  # or (node.prefix and "-" in node.prefix)
    return res


def structure_leaf(node, is_negated):
    if is_negated:
        return {node.field: {"$ne": node.term}}
    else:
        return {node.field: node.term}


def de_morgan_law(operator):
    if operator == QueryOperator.AND:
        return QueryOperator.AND
    elif operator == QueryOperator.OR:
        return QueryOperator.OR
    elif operator == QueryOperator.AND_NOT:
        return QueryOperator.AND
    elif operator == QueryOperator.OR_NOT:
        return QueryOperator.OR
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
        is_negated = is_negated_op(node)
        operator = node.operator
        if is_negated:
            operator = de_morgan_law(operator)

        if node.operator == None:
            return structure_leaf(node.left, is_negated)
        # The right node would be negated in any of the AND NOT or OR NOT operators
        return structure_operator(
            operator, node.left.accept(self), node.right.accept(self, is_negated)
        )

    @when(QueryOperand)
    def visit(self, node: QueryOperand, is_negated: bool = False):
        if node.operator is not None:
            is_negated = is_negated or is_negated_op(node)
            operator = node.operator
            if is_negated:
                operator = de_morgan_law(operator)
            # Because of the openapi generator, this is a problem with nested expressions, e.g. "amr_amp: Sensitiv AND NOT (isolate_id: 1 OR isolate_id: 3)"
            # return structure_operator(operator, node.left.accept(self, is_negated), node.right.accept(self, is_negated))
            return structure_operator(
                operator,
                QueryOperand.accept(self, node.left, is_negated),
                QueryOperand.accept(self, node.right, is_negated),
            )
        elif node.field and node.term:
            # TODO: figure out what implicit should be in the case of node.field
            is_negated = is_negated or (node.prefix is not None and "-" in node.prefix)
            return structure_leaf(node, is_negated)
