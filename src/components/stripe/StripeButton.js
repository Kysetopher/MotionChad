import React, { useState } from 'react';
import LoadingSwirl from '../items/LoadingSwirl'
import StripeInterface from './interface'

export const RemoveCustomer = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleRemoveCustomer = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);
  
    try {
      const response = await StripeInterface.removeCustomer();
  
      if (response && response.error) { 
        setError(response.error); 
        return;
      }
      
      setSuccess(true);
    } catch (error) {
      setError(error.message);
    } finally {
      window.location.reload(); // Only reload if necessary
      setLoading(false);
    }
  };

  return (
    <div>
      <button className="stripe-button" onClick={handleRemoveCustomer} disabled={loading}>
        {loading ? 'Removing...' : 'Remove Stripe Customer'}
      </button>
      
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      {success && <p style={{ color: 'green' }}>Customer removed successfully!</p>}
    </div>
  );
};

export const RemoveSubscription = ({subscriptionId}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleRemoveSubscription = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);
  
    try {
      const response = await StripeInterface.cancelSubscription(subscriptionId);
  
      if (response && response.error) {
        setError(response.error);
        return;
      }
  
      setSuccess(true);
    } catch (error) {
      setError(error.message); // No need to log here, as it's already logged in the interface.
    } finally {
      window.location.reload();
      setLoading(false);
    }
  };

  return (
    <div>
      <button className="stripe-button" onClick={handleRemoveSubscription} disabled={loading}>
        {loading ? <div className="subscription-button-processing"><LoadingSwirl size="15"/></div> : 'Remove Stripe Subscription'}
      </button>
      
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      {success && <p style={{ color: 'green' }}>Subscription removed successfully!</p>}
    </div>
  );
};

export const RemovePaymentMethod = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleRemovePaymentMethod = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);
  
    try {
      const response = await StripeInterface.removePaymentMethod();
  
      if (response && response.error) {
        setError(response.error);
        return;
      }
  
      setSuccess(true);
    } catch (error) {
      setError(error.message);
    } finally {
      window.location.reload(); 
      setLoading(false);
    }
  };

  return (
    <div>
      <button className="stripe-button" onClick={handleRemovePaymentMethod} disabled={loading}>
        {loading ? 'Removing...' : 'Remove Payment Method'}
      </button>
      
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      {success && <p style={{ color: 'green' }}>Payment method removed successfully!</p>}
    </div>
  );
};

export const CancelSubscription = ({subscriptionId}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleCancelSubscription = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);
  
    try {
      const updates = { cancel_at_period_end: true };
      const response = await StripeInterface.updateSubscription(subscriptionId, updates);
  
      if (response && response.error) {
        setError(response.error);
        return;
      }
  
      setSuccess(true);
      console.log('Subscription successfully updated to cancel at period end.');
    } catch (error) {
      setError(error.message); // No need to log here, as it's already logged in the interface.
    } finally {
      window.location.reload();
      setLoading(false);
    }
  };

  return (
    <div>

      <div> <button className="subscription-button-manage"  disabled={loading} onClick={handleCancelSubscription}> {loading ? <div className="subscription-button-processing"><LoadingSwirl size="15"/></div> : error ? 'ERROR': success ? 'CANCELED!' :'CANCEL'  }</button></div>      
        <div >
                    {error && <div className="stripe-menu-error">{error}</div>}
        </div>
    
    </div>
  );
};

export const Subscribe = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubscribe = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);
  
    try {
      const response = await StripeInterface.createSubscription();
  
      if (response && response.error) {
        setError(response.error);
        return;
      }
  
      setSuccess(true);
    } catch (error) {
      setError(error.message); // No need to log here, as it's already logged in the interface.
    } finally {
      window.location.reload();
      setLoading(false);
    }
  };

  return (
    <div>
      <button className="stripe-button" onClick={handleSubscribe} disabled={loading}>
      <div className="card">
                <div className="inside">
                  {/* <img  className="card-img" src='/account_subscription.svg' alt="search-empty"  />  */}
                  <div className="card-body-with-img">
                      <div className="card-title">{loading ? <div className="subscription-button-processing"><LoadingSwirl size="15"/></div> : 'Subscribe '} </div>
                      {error && <div className="card-summary stripe-menu-error">{error}</div>}
                      {success && <div className="card-summary">Customer subscribed successfully!</div>}
                  </div>
              </div>
            </div>
      </button>
    
    </div>
  );
};

export const RenewSubscription = ({subscriptionId}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleRenewSubscription = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);
  
    try {
      const updates = { cancel_at_period_end: false };
      const response = await StripeInterface.updateSubscription(subscriptionId, updates);
  
      if (response && response.error) {
        setError(response.error);
        return;
      }
  
      setSuccess(true);
    } catch (error) {
      setError(error.message); // No need to log here, as it's already logged in the interface.
    } finally {
      window.location.reload();
      setLoading(false);
    }
  };

  return (
    <div>
        <div> <button 
                className="subscription-button"  
                disabled={loading} 
                onClick={handleRenewSubscription}>
                  {loading ? <div className="subscription-button-processing"><LoadingSwirl size="15"/></div> : error ? 'ERROR': success ? 'RENEWED!' :'RENEW'  }
                   
              </button>
        </div>      
        <div >{error && <div className="stripe-menu-error">{error}</div>}</div>
    </div>
  );
};