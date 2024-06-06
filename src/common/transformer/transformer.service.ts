import { Prisma } from '@prisma/client';

export function transformWhereInput(where: any): Object {
  const transformedWhere: Object = {};

  if (where && typeof where === 'object') {
    for (const key in where) {
      if (where.hasOwnProperty(key)) {
        const value = where[key];

        if (typeof value === 'object') {
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
    if (typeof parseInt(value) === 'number') return parseInt(value);
    else if (typeof parseFloat(value) === 'number') return parseFloat(value);
    else if (value.toLowerCase() === 'true') {
      return true;
    } else if (value.toLowerCase() === 'false') {
      return false;
    } else if (value.toLowerCase() === 'null') {
      return null;
    }
  }

  return value;
}
