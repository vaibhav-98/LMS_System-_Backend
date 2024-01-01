import { Router } from 'express';;
import { allPayment, buySubcription, cancleSubscription, getRazorpayApiKey, verifySubscription } from '../controllers/payment.controller.js';
import { authrizedRoles, isLoggedIn } from '../middlewares/auth.middleware.js';

const router = Router();

router
      .route('/razorpay-key')
      .get(
         isLoggedIn,
        getRazorpayApiKey
        );

router  
      .route('/subscribe') 
      .post(
        isLoggedIn,
        authrizedRoles('ADMIN'),
        buySubcription
        ) 
      
router
      .route('/verify')
      .post(verifySubscription)
      
router 
     .route('/unsubscribe')
     .post(
        isLoggedIn,
        cancleSubscription
        )

router
      .route('/')
      .get(
        isLoggedIn,
        allPayment
        )     




export default router;