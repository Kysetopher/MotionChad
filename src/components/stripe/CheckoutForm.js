import React, { useEffect, useState } from 'react';
import { CardNumberElement, CardExpiryElement, CardCvcElement,  useStripe, useElements } from '@stripe/react-stripe-js';
import { useGeneralContext } from '../../ContextProvider';
import axios from 'axios';
import '../../styles/stripe.css';
import LoadingSwirl from '../items/LoadingSwirl'
import StripeInterface from './interface'

//-----------------------------------------|                          |---------------------------------------------------------------------------
//                                         |  COMMON STRIPE ELEMENTS  |
//-----------------------------------------|__________________________|---------------------------------------------------------------

const stripeElementOptions = {
  style: {
    base: {
      color: 'white',
      ':-webkit-autofill': {
        backgroundColor: '#02020200',
        '-webkit-text-fill-color': 'white',
      },
    },
    invalid: {
      color: '#ff4d4f',
    },
    autofill: {
      backgroundColor: '#02020200',
    },
  },
};

const renderStripeElements = () => (
  <div className="stripe-card-information">
    <CardNumberElement className="stripe-card-element-full" options={stripeElementOptions} />
    <CardExpiryElement className="stripe-card-element-half" options={stripeElementOptions} />
    <CardCvcElement className="stripe-card-element-half" options={stripeElementOptions} />
  </div>
);







//-----------------------------------------|                          |---------------------------------------------------------------------------
//                                         |  SUBSCRIBE - RESUBSCRIBE |
//-----------------------------------------|__________________________|---------------------------------------------------------------
  
export const CheckoutSubscribe = () => {
  const { mobileClient, userData, subscriptions, paymentMethod, stripeCustomer } = useGeneralContext();
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [forceManual, setForceManual] = useState(false);

  const handleSelectDefault = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await StripeInterface.createSubscription();
      if (response && response.error) {
        setError(response.error);
        setLoading(false);
        return;
      }
      window.location.reload();
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  const handleSelectManual = () => setForceManual(true);

  const handleNewPayment = async (event) => {
    event.preventDefault();
    setLoading(true);

    const cardNumberElement = elements.getElement(CardNumberElement);
    const cardholderName = document.querySelector('.stripe-card-customer-name').value;

    const { error: stripeError, paymentMethod } = await stripe.createPaymentMethod({
      type: 'card',
      card: cardNumberElement,
      billing_details: {
        name: cardholderName,
        // address: {
        //   postal_code: postalCode,
        // },
        email: userData.email,
      },
    });

    if (stripeError) {
      setError(stripeError.message);
      setLoading(false);
      return;
    }

    try {
      if (stripeCustomer) {
        await StripeInterface.attachDefaultPayment(paymentMethod.id);
        await StripeInterface.createSubscription();
      } else {
        await axios.post('/api/stripe/createCustomer', {
          paymentMethodId: paymentMethod.id,
          customerEmail: userData.email,
        });
      }
      window.location.reload();
    } catch (axiosError) {
      setError(axiosError.response?.data?.message || 'An error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="stripe-status-active">POWER-USER</div>
      <div className="stripe-status-description">$20 / month</div>

      {(paymentMethod && subscriptions.length === 0) && ( 
        
        <div className="responsive-container-cell" id={mobileClient ? 'responsive-container-mobile' : 'responsive-container-desktop'}>
          <img className="responsive-container-cell-img" src="/icon/card.svg" alt="search-empty" />
          
          <div className="responsive-container-information">
            {paymentMethod?.brand?.toUpperCase()} ....{paymentMethod?.last4}
            {paymentMethod?.expired && <div>Expired</div>}
            <div>
            <button className="subscription-button" onClick={handleSelectDefault} disabled={loading}>
              {loading ? <div className="subscription-button-processing"><LoadingSwirl size="15" /></div> : 'APPROVE'}
            </button>
            </div>
          </div>
        </div>
      )}

      {(!forceManual && paymentMethod) && (
        <div className="stripe-button-error">
          <div></div>
          <button className="subscription-button" onClick={handleSelectManual} disabled={!stripe}>Enter New Card</button>
        </div>
      )}

      {(!paymentMethod || paymentMethod?.expired || forceManual) && (
        <div className="responsive-container-cell" id={mobileClient ? 'responsive-container-mobile' : 'responsive-container-desktop'}>
          <form onSubmit={handleNewPayment} className="stripe-checkout-form">
            <div className="stripe-checkout-header">Card Information</div>
            {renderStripeElements()}
            <div className="stripe-checkout-header">Cardholder Name</div>
            <input
              className="stripe-card-customer-name"
              type="text"
              required
            />
            <div className="stripe-button-error">
              <div className="stripe-menu-error">{error}</div>
              <button className="subscription-button" type="submit" disabled={!stripe || loading}>
                {loading ? <div className="subscription-button-processing"><LoadingSwirl size="15" /></div> : 'APPROVE'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

//-----------------------------------------|                          |---------------------------------------------------------------------------
//                                         |  UPDATE PAYMENT METHOD   |
//-----------------------------------------|__________________________|---------------------------------------------------------------
 

export const CheckoutUpdate = () => {
  const { mobileClient,userData,subscriptions, paymentMethod , stripeCustomer} = useGeneralContext();
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [forceManual, setForceManual] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState([]);

  const enterNewPayment = async (event) => {
    event.preventDefault();
    setLoading(true);

    const cardNumberElement = elements.getElement(CardNumberElement);
    const cardholderName = document.querySelector('.stripe-card-customer-name').value;

    const { error: stripeError, paymentMethod } = await stripe.createPaymentMethod({
      type: 'card',
      card: cardNumberElement,
      billing_details: {
        name: cardholderName,
        // address: {
        //   postal_code: postalCode,
        // },
        email: userData.email,
      },
    });
  
    if (stripeError) {
      setError(stripeError.message);
      setLoading(false);
      return;
    }
    await StripeInterface.attachDefaultPayment(paymentMethod.id);

    window.location.reload();
    setLoading(false); 
    
  };
  
  const selectExistingPayment = async (id) => {
    setLoading(true);
    setError(null);
  
    try {
      const updates = {
        invoice_settings: {
          default_payment_method: id,
        },
      };
  
      const response = await StripeInterface.updateCustomer(updates);
  
      if (response && response.error) {
        setError(response.error);
      }
    } catch (error) {
      setError('An error occurred while updating payment method.');
    } finally {
      setLoading(false);
      window.location.reload();
    }
  };
  
  const getPaymentMethods = async () => {
    try {
      const response = await StripeInterface.getPaymentMethods();
  
      if (response && response.error) {
        setError(response.error);
      } else {
        setPaymentMethods(response.paymentMethods);
      }
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      setError('An error occurred while fetching payment methods.');
    }
  };
  
  useEffect(() => {
    getPaymentMethods();
  }, []);

  return (
    <div>
      <div className="stripe-status-active">POWER-USER</div>
      <div className="stripe-status-description">$20 / month</div>

      {paymentMethods.length > 0 && (
        <div className="payment-methods-list">
          {paymentMethods.map((method) => (
            paymentMethod.id !== method.id && (
              <div key={method.id} className="responsive-container-cell" id={mobileClient ? 'responsive-container-mobile' : 'responsive-container-desktop'}>
                <img className="responsive-container-cell-img" src="/icon/card.svg" alt="search-empty" />
                <div className="responsive-container-information">
                  {method?.brand?.toUpperCase()} ....{method?.last4}
                  {method?.expired && <div>Expired</div>}
                  <div>
                    <button
                      className="subscription-button"
                      onClick={() => selectExistingPayment(method.id)}
                      disabled={!stripe || loading}
                    >
                      {loading ? <div className="subscription-button-processing"><LoadingSwirl size="15" /></div> : 'SELECT'}
                    </button>
                  </div>
                </div>
              </div>
            )
          ))}
        </div>
      )}

      <div className="responsive-container-cell" id={mobileClient ? 'responsive-container-mobile' : 'responsive-container-desktop'}>
        <form onSubmit={enterNewPayment} className="stripe-checkout-form">
          <div className="stripe-checkout-header">Card Information</div>
          {renderStripeElements()}
          <div className="stripe-checkout-header">Cardholder Name</div>
          <input
            className="stripe-card-customer-name"
            type="text"
            required
          />
          <div className="stripe-button-error">
            <div className="stripe-menu-error">{error}</div>
            <button className="subscription-button" type="submit" disabled={!stripe || loading}>
              {loading ? <div className="subscription-button-processing"><LoadingSwirl size="15" /></div> : 'APPROVE'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
