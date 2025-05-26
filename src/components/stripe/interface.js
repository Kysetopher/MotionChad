


const StripeInterface = {

//-----------------------------------------|                          |---------------------------------------------------------------------------
//                                         |     STRIPE CREATE        |
//-----------------------------------------|__________________________|---------------------------------------------------------------
  
async createSubscription() {
  try {
    const response = await fetch('/api/stripe/createSubscription', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      return { error: errorData.error || 'Failed to create subscription.' };
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating subscription:', error);
    return { error: error.message };
  }
},


//-----------------------------------------|                          |---------------------------------------------------------------------------
//                                         |   STRIPE EDIT / DELETE   |
//-----------------------------------------|__________________________|---------------------------------------------------------------
 

async removeCustomer() { 
  try {
    const response = await fetch('/api/stripe/removeCustomer', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      return { error: errorData.error || 'Failed to remove customer.' };
    }

    return await response.json();
  } catch (error) {
    console.error('Error removing customer:', error);
    return { error: error.message };
  }
},

async cancelSubscription(subscriptionId) {
  try {
    const response = await fetch('/api/stripe/cancelSubscription', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        subscriptionId,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return { error: errorData.error || 'Failed to cancel subscription.' };
    }

    return await response.json();
  } catch (error) {
    console.error('Error canceling subscription:', error);
    return { error: error.message };
  }
},

async removePaymentMethod() {
  try {
    const response = await fetch('/api/stripe/removePaymentMethod', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      return { error: errorData.error || 'Failed to remove payment method.' };
    }

    return await response.json();
  } catch (error) {
    console.error('Error removing payment method:', error);
    return { error: error.message };
  }
},

async updateSubscription(subscriptionId, updates) {
  try {
    const response = await fetch('/api/stripe/updateSubscription', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        subscriptionId,
        updates,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return { error: errorData.error.message || 'Failed to update subscription.' };
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating subscription:', error);
    return { error: error.message };
  }
},

async updateCustomer(updates) {
  try {
    const response = await fetch('/api/stripe/updateCustomer', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return { error: errorData.error || 'Failed to update customer.' };
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating customer:', error);
    return { error: error.message };
  }
},

async attachDefaultPayment(paymentMethodId) {
  try {
    const response = await fetch('/api/stripe/attachAsDefaultPayment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        paymentMethodId,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return { error: errorData.error || 'Failed to attach default payment method.' };
    }

    return await response.json();
  } catch (error) {
    console.error('Error attaching default payment method:', error);
    return { error: error.message };
  }
},

//-----------------------------------------|                          |---------------------------------------------------------------------------
//                                         |       STRIPE GET         |
//-----------------------------------------|__________________________|---------------------------------------------------------------


async getPaymentMethods() {
  try {
    const response = await fetch('/api/stripe/getPaymentMethods');

    if (!response.ok) {
      const errorData = await response.json();
      return { error: errorData.error || 'Failed to fetch payment methods.' };
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching payment methods:', error);
    return { error: error.message };
  }
},

};
export default StripeInterface;