class ApiError extends Error{
    constructor(
        statusCode,
        message="Internal Server Error",
        errors=[],
        data

    ){
        super(message)
        this.statusCode = statusCode
        this.data = data
        this.message = message
        this.success = false
        this.errors = errors
    }
}

export { ApiError };