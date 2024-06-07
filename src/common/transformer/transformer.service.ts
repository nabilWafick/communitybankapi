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
    }
    return value.toString();
  }

  return value;
}
