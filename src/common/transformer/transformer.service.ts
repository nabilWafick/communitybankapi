import { Prisma } from '@prisma/client';

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

/// * FIRTS FUNCTION * ///
/*
function convertValueToCorrectType(value: any): any {
  if (typeof value === 'string') {
    if (typeof parseInt(value) === 'number' && !Number.isNaN(parseInt(value))) {
      return parseInt(value);
    } else if (
      typeof parseFloat(value) === 'number' &&
      !Number.isNaN(parseFloat(value))
    ) {
      return parseFloat(value);
    } else if (value.toLowerCase() === 'true') {
      return true;
    } else if (value.toLowerCase() === 'false') {
      return false;
    } else if (value.toLowerCase() === 'null') {
      return null;
    } else {
      const parsedDate = new Date(value);
      if (!isNaN(parsedDate.valueOf())) {
        console.log('Date');
        return parsedDate;
      }
     
    }
  }

  return value;
}
*/

///* TEST SECOND

/*
function convertValueToCorrectType(value: any): any {
  // Check if the input value is a number
  if (typeof value === 'number') {
    return value;
  }
  // Check if the input value is a string
  else if (typeof value === 'string') {
    // Check if the string can be parsed as an integer
    if (!isNaN(parseInt(value))) {
      return parseInt(value);
    }
    // Check if the string can be parsed as a float
    else if (!isNaN(parseFloat(value))) {
      return parseFloat(value);
    }
    // Check if the string represents a boolean value
    else if (value.toLowerCase() === 'true') {
      return true;
    } else if (value.toLowerCase() === 'false') {
      return false;
    }
    // Check if the string represents null
    else if (value.toLowerCase() === 'null') {
      return null;
    }
    // Check if the string can be parsed as a date
    else {
      const parsedDate = new Date(value);
      if (!isNaN(parsedDate.valueOf())) {
        return parsedDate;
      }
    }
    // If none of the above conditions match, return the string as-is
    return value;
  }
  // If the input value is not a number or string, return it as-is
  return value;
}
*/

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
    if (typeof parseInt(value) === 'number' && !Number.isNaN(parseInt(value))) {
      return parseInt(value);
    } else if (
      typeof parseFloat(value) === 'number' &&
      !Number.isNaN(parseFloat(value))
    ) {
      return parseFloat(value);
    } else if (value.toLowerCase() === 'true') {
      return true;
    } else if (value.toLowerCase() === 'false') {
      return false;
    } else if (value.toLowerCase() === 'null') {
      return null;
    }
  }

  // Return the original value for unsupported types
  return value;
}
