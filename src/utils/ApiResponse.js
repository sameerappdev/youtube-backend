class ApiResponse {
  constructor(statusCode, data, message = "Success") {
    // this.statusCode = statusCode;
    this.success = statusCode < 400; // Status Code should be less than 400 bcz 400 is Client Error and 500 is Server Error
    this.message = message;
    this.data = data;
  }
}

export { ApiResponse };
