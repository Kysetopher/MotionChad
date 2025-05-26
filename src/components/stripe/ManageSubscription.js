import React from 'react';
import { useState, useEffect } from 'react';
import { Box,DecorativeBox,Section, Flex, Container } from '@radix-ui/themes'; 
import {RemoveSubscription, RemoveCustomer,RemovePaymentMethod, CancelSubscription, RenewSubscription } from '../stripe/StripeButton'
import { useGeneralContext } from '../../ContextProvider';
import '../../styles/Card.css';

const ManageSubscription = () => {

  const { mobileClient, pageSTATES, subscriptions ,paymentMethod } = useGeneralContext();

  return (
    <div className="subscriptions-settings">
        <div  className="responsive-container-cell" key={subscriptions[0].id}>
            <RemoveCustomer/>
            <RemoveSubscription subscriptionId ={subscriptions[0].id}/>
            {paymentMethod && < RemovePaymentMethod paymentMethodId={paymentMethod.id}/>}
        </div>
    </div>
        
 
  );
};

export default ManageSubscription;