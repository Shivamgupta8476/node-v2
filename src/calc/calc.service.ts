import { Injectable, BadRequestException } from '@nestjs/common';
import { CalcDto } from './calc.dto';

@Injectable()
export class CalcService {
  // Method to calculate the expression
  calculateExpression(calcBody: CalcDto) {
    const { expression } = calcBody;

    try {
      // Evaluate the expression and return the result
      const result = this.evaluateExpression(expression);
      return result;
    } catch (error) {
      // Catch any errors during evaluation and throw a BadRequestException
      throw new BadRequestException({
        statusCode: 400,
        message: 'Invalid expression provided',
        error: 'Bad Request',
      });
    }
  }

  // Method to evaluate the expression using infix notation
  private evaluateExpression(expression: string): number {
    // Stacks for operands and operators
    const operands: number[] = [];
    const operators: string[] = [];

    // Precedence of operators
    const precedence: { [key: string]: number } = {
      '+': 1,
      '-': 1,
      '*': 2,
      '/': 2,
    };

    // Function to perform calculation
    const calculate = () => {
      const operator = operators.pop();
      const operand2 = operands.pop();
      const operand1 = operands.pop();

      // Check for missing operands or operator
      if (
        operand1 === undefined ||
        operand2 === undefined ||
        operator === undefined
      ) {
        throw new Error('Invalid expression');
      }

      // Perform calculation based on operator
      switch (operator) {
        case '+':
          operands.push(operand1 + operand2);
          break;
        case '-':
          operands.push(operand1 - operand2);
          break;
        case '*':
          operands.push(operand1 * operand2);
          break;
        case '/':
          if (operand2 === 0) {
            throw new Error('Division by zero');
          }
          operands.push(operand1 / operand2);
          break;
        default:
          throw new Error('Invalid operator');
      }
    };

    // Tokenize the expression
    const tokens = expression.match(/\d+|[-+*/]/g);

    if (!tokens) {
      throw new Error('Invalid expression');
    }

    // Process each token in the expression
    for (const token of tokens) {
      if (!isNaN(Number(token))) {
        // If token is a number, push it to the operands stack
        operands.push(Number(token));
      } else if (token in precedence) {
        // If token is an operator
        // Pop operators from stack to perform calculations until precedence is satisfied
        while (
          operators.length > 0 &&
          precedence[operators[operators.length - 1]] >= precedence[token]
        ) {
          calculate();
        }
        // Push current operator to the operators stack
        operators.push(token);
      } else {
        // If token is not a number or operator, throw error
        throw new Error('Invalid token');
      }
    }

    // Perform remaining calculations
    while (operators.length > 0) {
      calculate();
    }

    // Ensure only one result is left in operands stack
    if (operands.length !== 1 || operators.length !== 0) {
      throw new Error('Invalid expression');
    }

    // Return the final result
    return operands.pop()!;
  }
}
