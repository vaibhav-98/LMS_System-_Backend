import { razorpay } from "../server.js";
import AppError from "../utils/error.utils.js";

export const getRazorpayApiKey = async (req,res,next) => {
       try {
        res.status(200).json({
            success: true,
            message: 'Razarpay API key',
            key: process.env.RAZORPAY_KEY_ID
        });
       } catch (e) {
         return next(
            new AppError(e.message,500)
         )
       }

}

//================================================================================================
export const  buySubcription = async (req,res,next) => {
    try {
        const { id } = req.user ;
        const user = await User.findById(id);
    
        if(!user) {
            return next(
                new AppError('Unauthorized , please login')
            )
        }
    
        if(user.role === 'ADMIN') {
            return next(
                new AppError(
                    'ADMIN cannot purchase a subscription,',400
                )
            )
        }
    
        const subscription = await razorpay.subscription.create({
            plan_id: process.env.RAZORPAY_PLAN_ID,
            customer_notify:1
        });
    
        user.subscription.id = subscription.id ;
        user.subscription.status = subscription.status;
    
         await  user.save()
    
         res.status(200).json({
            success: true,
            message: 'Subscribed Successfully',
            subscription_id: subscription.id,
         })
    } catch (e) {
        
    }   
}


//===========================================================================================
export const  verifySubscription = async (req,res,next) => {
    try {
        const { id } = req.user;
    const { razorpay_payment_id, razorpay_signature, razorpay_subscription_id } = req.body;

    const user = await User.findById(id);
    if(!user) {
        return next(
            new AppError('Unauthorized , please login')
        )
    }

    const subscriptionId = user.subscription.id;

    const generatedSignature = crypto 
          .createHmac ('sha256', process.env.RAZORPAY_SECRET)
          .update(`${razorpay_payment_id}|${subscriptionId}`)
          .digest('hex');

      if(generatedSignature !== razorpay_signature) {
        return next(
            new AppError('Payment not verified, please try again',500)
        )
      }   
      
      await Payment.create({
        razorpay_payment_id,
        razorpay_signature,
        razorpay_subscription_id ,
      });

      user.subscription.status = 'active';
      await user.save();


      res.status(200).json({
        success: true,
        message: 'Payment verified successfully!'
      })
    } catch (e) {
        return next(
            new AppError(e.message,500)
        )
    }
    
    
}


export const  cancleSubscription = async (req,res,next) => {
    try{
        const { id } =  req.user ;

     const user = await User.findById(id);
     
     if(!user) {
        return next(
            new AppError('Unauthorized , please login')
        )
    }

    if(user.role === 'ADMIN') {
        return next(
            new AppError(
                'ADMIN cannot purchase a subscription,',400
            )
        )
    }

    const subscriptionId = user.subscription.id;
    
    const subscription =  await razorpay.subscriptions.cancel(
        subscriptionId
    )

    user.subscription.status = subscription.status;

    await user.save()

}
catch(e) {
   return next(
    new AppError(e.message,500)
   )
}
         
}

export const  allPayment = async (req,res,next) => {

    
}
