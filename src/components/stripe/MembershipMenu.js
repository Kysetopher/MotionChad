import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import '../../styles/stripe.css';
import { CheckoutSubscribe , CheckoutUpdate } from './CheckoutForm'; // Your custom form component
import { useGeneralContext } from '../../ContextProvider';
import ManageSubscription from './ManageSubscription';
import {RemoveCustomer, CancelSubscription, RenewSubscription } from '../stripe/StripeButton'

const FEATURES = [
  'Card Generation',
  'Card Sharing',
  'Create Contacts',
  'Card Follow-up',
  'Memory',
  'Personalized Prompts'
];

const stripePromise = loadStripe(process.env.STRIPE_PUBLIC_KEY);

export const Inactive = () => {
  const { mobileClient, pageSTATES, pageState,  setPageState } = useGeneralContext();
  const [features, setFeatures] = useState([]);


  const handleSubmit = () => {

    setPageState(pageSTATES.CHECKOUT);
  };

  return (
    <div className='responsive-page' id= { mobileClient ? 'responsive-page-mobile' : 'responsive-page-desktop' }>
      {pageState.id === "checkout"? (
        <Elements stripe={stripePromise}>
          <CheckoutSubscribe />
        </Elements>
      ) : (
        <>
          <div className="stripe-status-inactive" >INACTIVE</div>
          <div className="responsive-container-columns" id={ mobileClient ? 'responsive-container-mobile' : 'responsive-container-desktop'}>
            <div className="subscription-cell">
              <div className="subscription-title"> Power-User</div>
              <div className="subscription-description">$20 / month</div>
            </div>
            <div> <button className="subscription-button" onClick={handleSubmit}>ACTIVATE</button></div>
          </div>
          <div className="subscription-table" id={ mobileClient ? 'subscription-container-mobile' : 'subscription-container-desktop'}>
             <table >
              <thead>
                <tr>
                  <th>FEATURES</th>
                  <th>INACTIVE</th>
                  <th>ACTIVE</th>
                </tr>
              </thead>
              <tbody>
                {FEATURES.map((feature, index) => (
                  <tr key={index}  className="subscription-table-row">
                    <td>{feature}</td>
                    <td className="subscription-field-inactive">{feature === 'Card Generation' ? '15/month' : '✘'}</td>
                    <td className="subscription-field-active">{feature === 'Card Generation' ? 'Unlimited' : '✔'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};


export const Active = () => {
  
  const { mobileClient, pageSTATES, pageState,  setPageState, subscriptions, paymentMethod} = useGeneralContext();

  const handleChangePayment = () => {
    setPageState(pageSTATES.CHECKOUT);
  };

  return (
    <div className='responsive-page' id= { mobileClient ? 'responsive-page-mobile' : 'responsive-page-desktop' }>
      {pageState.id === "checkout"? (
        <Elements stripe={stripePromise}>
          <CheckoutUpdate/>
        <  ManageSubscription />
        </Elements>
    
      ) : (
        <>
          <div className="stripe-status-active" >ACTIVE</div>
          { subscriptions[0].id && subscriptions.map((subscription) => (
            <div key={subscription.id}>
          
                    {!subscription.cancel_at_period_end && ( 
                      <div className="stripe-status-description">   Renews <strong>{new Date(subscription.current_period_end * 1000).toLocaleDateString()}</strong> for ${subscription.items[0].price}</div>
                    )}
                      {subscription.cancel_at_period_end && (
                        <div className="stripe-status-description ">Your Subscription Ends <strong className="stripe-menu-error">{new Date(subscription.current_period_end * 1000).toLocaleDateString()}</strong> <br/>ReSubscribe to enjoy uninterrupted access</div>
                      )}
                
            </div>
          ))}

          <div className="responsive-container-columns" id={ mobileClient ? 'responsive-container-mobile' : 'responsive-container-desktop'}>
            <div className="subscription-cell">
              <div className="subscription-title"> Power-User</div>
              <div className="subscription-description">$20 / month</div>
            </div>
            {subscriptions[0].cancel_at_period_end && ( 
              <RenewSubscription subscriptionId ={subscriptions[0].id}/>
            )}

            {!subscriptions[0].cancel_at_period_end && ( 
              <CancelSubscription subscriptionId ={subscriptions[0].id}/>
            )}
          </div>
         


          {subscriptions[0].cancel_at_period_end ?  
               
                 <div className="subscription-table" id={ mobileClient ? 'responsive-container-mobile' : 'responsive-container-desktop'}>
                 <table >
                  <thead>
                    <tr>
                      <th>FEATURES</th>
                      <th>INACTIVE</th>
                      <th>ACTIVE</th>
                    </tr>
                  </thead>
                  <tbody>
                    {FEATURES.map((feature, index) => (
                      <tr key={index}  className="subscription-table-row">
                        <td>{feature}</td>
                        <td className="subscription-field-inactive">{feature === 'Card Generation' ? '15/month' : '✘'}</td>
                        <td className="subscription-field-active">{feature === 'Card Generation' ? 'Unlimited' : '✔'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
             :
           

            <div className="responsive-container-cell" id={ mobileClient ? 'responsive-container-mobile' : 'responsive-container-desktop'}>
            <img  className="responsive-container-cell-img" src='/icon/card.svg' alt="search-empty"  /> 
            <div className="responsive-container-information" >
              {paymentMethod?.brand?.toUpperCase()}  ....{paymentMethod?.last4}
              {paymentMethod?.expired && <div > Expired </div>}
           
              <div> <button className="subscription-button-manage" onClick={handleChangePayment}> {paymentMethod?.expired ?  'UPDATE' : 'CHANGE'} </button></div> 
            </div>
          </div>
          } 

        </>
      )}
    </div>
  );
};