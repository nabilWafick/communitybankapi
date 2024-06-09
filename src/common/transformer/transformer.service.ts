import { Prisma } from '@prisma/client';
import { debugPort } from 'process';

export function transformWhereInput(where: any): Object {
  const transformedWhere: Object = {};

  if (where && typeof where === 'object') {
    for (const key in where) {
      if (where.hasOwnProperty(key)) {
        const value = where[key];

        if (
          (key === 'AND' || key === 'OR' || key === 'NOT') &&
          Array.isArray(value)
        ) {
          transformedWhere[key] = value.map((andCondition) =>
            transformWhereInput(andCondition),
          );
        } else if (Array.isArray(value)) {
          transformedWhere[key] = value.map((data) =>
            convertValueToCorrectType(data),
          );
        } else if (typeof value === 'object') {
          transformedWhere[key] = transformWhereInput(value);
        } else {
          transformedWhere[key] = convertValueToCorrectType(value);
        }
      }
    }
  }

  return transformedWhere;
}

/// * TEST THIRD
function convertValueToCorrectType(value: any): any {
  if (typeof value === 'string') {
    const timestamptzRegex =
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+\-]\d{2}:\d{2})$/;
    if (timestamptzRegex.test(value)) {
      try {
        return new Date(value);
      } catch (error) {
        // Handle potential parsing errors gracefully (e.g., log or return a default value)
        console.log(`Failed to parse timestamptz string: ${value}`);
      }
    }

    // Handle numbers, booleans, and null as before
    if (value.toLowerCase() === 'true') {
      return true;
    } else if (value.toLowerCase() === 'false') {
      return false;
    } else if (value.toLowerCase() === 'null') {
      return null;
    } else if (
      typeof parseInt(value) === 'number' &&
      !Number.isNaN(parseInt(value))
    ) {
      return parseInt(value);
    } else if (
      typeof parseFloat(value) === 'number' &&
      !Number.isNaN(parseFloat(value))
    ) {
      return parseFloat(value);
    }
  } else if (typeof value === 'object') {
    return transformWhereInput(value);
  }

  // Return the original value for unsupported types
  console.log({ default: value });
  return value;
}
