import React from 'react';
import { useState, useEffect } from 'react';
import { Inactive ,Active} from '../stripe/MembershipMenu'; 
import '../../styles/stripe.css';
import '../../styles/Card.css';
import LoadingSwirl from '../items/LoadingSwirl';
import { useGeneralContext } from '../../ContextProvider';


const SettingsSubscription = () => {
  const { subscriptions, setSubscriptions, paymentMethod, setPaymentMethod, setStripeCustomer } = useGeneralContext();
  const [user, setUser] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try{
    const response = await fetch('/api/stripe/getCustomer');
    const data = await response.json();
    setStripeCustomer(!data.error ? true : false);
    setUser(data|| []);
    if (data.subscriptions && data.subscriptions.length > 0) {
      try {
        const subscriptionPromises = data.subscriptions.map(async (subscription) => {
          const subscriptionResponse = await fetch('/api/stripe/getSubscription', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ subscriptionId: subscription.id }),
          });
    
          return await subscriptionResponse.json();
        });
    
        const subscriptionsData = await Promise.all(subscriptionPromises);
        setSubscriptions(subscriptionsData);
      } catch (error) {
        // console.error('Error fetching subscriptions:', error);
        setSubscriptions([]);
      }
    } else {
      setSubscriptions([]);
    }

    if (data && data.default_payment_method) {

      const paymentData = data.default_payment_method
      
      setPaymentMethod(data.default_payment_method);
      // console.log(data.default_payment_method);
    } else {
      // console.log("here");
      setPaymentMethod(false);
    }

    setLoading(false);
  } catch  (error) {
    console.error(error);
  }
  };

  useEffect(() => {
    fetchUser();
  }, []);
  if (loading) return  <LoadingSwirl/> ;
  return (
    <div>
      {!user.subscriptions? <Inactive/>  : 
      subscriptions.length === 0 ?  <Inactive/> : < Active />}

    
      </ div>
  );
};

export default SettingsSubscription;