

// Just an easier way to catch async errors without the trycatch block
module.exports = (fn) => {
    return (req,res,next)=>{
      fn(req, res, next).catch(next);
  
    }
  };