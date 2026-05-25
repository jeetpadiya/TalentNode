const getParamValue = (value: string | string[] | undefined) =>
    Array.isArray(value) ? value[0] : value;


export { getParamValue };