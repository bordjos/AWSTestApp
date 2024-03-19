export const apiResponse = (status: number, message: string) => {
    return {
        status,
        message: JSON.stringify(message)
    };
}