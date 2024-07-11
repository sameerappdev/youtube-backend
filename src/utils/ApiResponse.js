class ApiResponse {
    constructor(statusCode, data, message = "Success" ){
        this.statusCode = statusCode;
        this.data = data;
        this.message = message;
        this.success = statusCode < 400 // Status Code should be less than 400 bcz 400 is Client Error and 500 is Server Error
    }
}