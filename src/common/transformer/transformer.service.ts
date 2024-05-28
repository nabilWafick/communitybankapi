import { Prisma } from '@prisma/client';

export function transformWhereInput(where: any): Prisma.ProductWhereInput {
  const transformedWhere: Prisma.ProductWhereInput = {};

  if (where && typeof where === 'object') {
    for (const key in where) {
      if (where.hasOwnProperty(key)) {
        const value = where[key];

        if (
          (key === 'AND' || key === 'OR' || key === 'NOT') &&
          Array.isArray(value)
        ) {
          transformedWhere.AND = value.map((andCondition) =>
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
    if (value.toLowerCase() === 'true') {
      return true;
    } else if (value.toLowerCase() === 'false') {
      return false;
    } else if (value.toLowerCase() === 'null') {
      return null;
    }
  }

  return value;
}
