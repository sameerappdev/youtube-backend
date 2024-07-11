// HIGHER ORDER FUNCTION: Functions that accept function as parameter or can return it
// const asyncHandler = (fn) => () => {}
// const asyncHandler = (fn) => async () => {}

// AsyncHandler using Promises
const asyncHandler = (requestHandler) => 
  (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next))
    .catch((err) => next(err));
  };

export { asyncHandler };

// AsyncHandler using Try-Catch
// const asyncHandler = (fn) => async (err, req, res, next) => {
//     try {
//         await fn(req, res, next)
//     } catch (error) {
//         res.status(err.code || 500).json({
//             success: false,
//             message: err.message || 'Server Error'
//         })
//     }
// }
