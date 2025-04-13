// module.exports = (fn) => {
//     return (res, req, next) => {
//         fn(res, req, next).catch(next);
//     }
// }

function wrapAsync(fn) {
    return function(res, req, next) {
        fn(res, req, next).catch(next);
    }
}

module.exports = wrapAsync;