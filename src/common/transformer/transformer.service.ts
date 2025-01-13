export function transformQueryParams(queryParams: { [key: string]: any }): {
  [key: string]: any;
} {
  // Deep copy the input object
  const copiedParams = queryParams;
  //JSON.parse(JSON.stringify(queryParams));
  const result: { [key: string]: any } = {};

  for (const key in copiedParams) {
    if (key.includes('[')) {
      // Nested key
      const parts = key.split('[');

      let currentDict = result;

      for (let i = 0; i < parts.length - 1; i++) {
        const innerKey = parts[i].slice(0, -1); // Remove trailing bracket
        // Directly assign empty object if inner key doesn't exist (modifying copy)
        if (!currentDict[innerKey]) {
          currentDict[innerKey] = {};
        }
        currentDict = currentDict[innerKey];
      }
      currentDict[parts[parts.length - 1].slice(0, -1)] =
        convertValueToCorrectType(copiedParams[key]);
    } else {
      // Top-level key
      result[key] = copiedParams[key];
    }
  }
  return result[''];
}

function checkQueryParams(queryParams: { [key: string]: any }): boolean {
  const copiedParams = JSON.parse(JSON.stringify(queryParams));

  for (const key in copiedParams) {
    if (key.includes('[')) {
      return true;
    }
  }
  return false;
}

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
        }
        // transform 'in' and 'not in' keys values to list
        else if ((key === 'in' || key == 'notIn') && !Array.isArray(value)) {
          transformedWhere[key] = [convertValueToCorrectType(value)];
        } else if (Array.isArray(value)) {
          transformedWhere[key] = value.map((data) =>
            convertValueToCorrectType(data),
          );
        } else if (typeof value === 'object') {
          if (checkQueryParams(value)) {
            transformedWhere[key] = transformQueryParams(value);
          } else {
            {
              transformedWhere[key] = transformWhereInput(value);
            }
          }
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
  //  console.log(' ===========> Value: ', value);
  //  console.log(' Type of Value: ', typeof value);
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
    } else if (value.toLowerCase() === '{[%null%]}') {
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
  }

  // Return the original value for unsupported types

  return value;
}
