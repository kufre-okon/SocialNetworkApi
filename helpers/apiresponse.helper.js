
class ApiResponse {

    constructor() {

    }

    /**
     * Return 422 error formatted response to the caller
     * @param {Response} res Router response object
     * @param {String} message  Additional message
     */
    handleValidationError(res, message) {
        res.status(422).json({            
            message: message
        });
    }

    /**
     * Return 500-error formatted response to the caller
     * @param {Response} res Router response object
     * @param {String} errorMessage String
     */
    handleError500(res, errorMessage) {
        res.status(500).json({
            message: errorMessage,
            payload: null
        });
    }

    /**
     * Return generic error formatted response to the caller
     * @param {Response} res Router response object
     * @param {*} statusCode HttpStatusCode
     * @param {String} errorMessage String
     */
    handleError(res, statusCode, errorMessage) {
        res.status(statusCode).json({
            message: errorMessage,
            payload: null
        });
    }

    /**
     * Return paginated api response to the user   
     * @param {Response} res Router response object 
     * @param {number} page Current page
     * @param {number} pageSize Total items per page
     * @param {number} totalItems Total items that matches the query
     * @param {Array} items Json data
     */

    successPaginate(res, page, pageSize, totalItems, items) {
        let paging = {
            page,
            pageSize,
            totalPages: Math.ceil(totalItems / pageSize),
            totalItems,
            items
        }
        this.successWithStatus(res, 200, paging, null);
    }

    /**
    * Return success api response to the user   
    * @param {Response} res Router response object 
    * @param {*} data Response data
    * @param {String} message Additional message
    */
    success(res, data, message) {
        this.successWithStatus(res, 200, data, message);
    }

    /**
    * Return success api response to the user
    * @param {Response} res Router response object
    * @param {*} statusCode HttpStatus Code
    * @param {*} data Response data
    * @param {String} message Additional message
    */
    successWithStatus(res, statusCode, data, message = null) {
        res.status(statusCode).json({
            payload: data,
            message
        })
    }
}

module.exports = new ApiResponse();