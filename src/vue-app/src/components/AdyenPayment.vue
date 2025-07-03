<template>
  <div class="adyen-payment">
    <div v-if="loading" class="loading">
      Loading payment form...
    </div>
    <div v-else-if="error" class="error">
      {{ error }}
    </div>
    <div v-else>
      <h2>Payment</h2>
      <div class="payment-summary">
        <p>Total: {{ formatPrice(amount) }}</p>
      </div>
      
      <div id="adyen-payment-container" ref="paymentContainer"></div>
      
      <div v-if="paymentResult" class="payment-result" :class="paymentResult.status">
        <p>{{ paymentResult.message }}</p>
        <button v-if="paymentResult.status === 'success'" @click="onContinue">Continue</button>
        <button v-if="paymentResult.status === 'error'" @click="resetPayment">Try Again</button>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'AdyenPayment',
  props: {
    amount: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: 'EUR'
    },
    returnUrl: {
      type: String,
      default: window.location.href
    }
  },
  data() {
    return {
      loading: true,
      error: null,
      checkout: null,
      paymentId: null,
      paymentResult: null
    };
  },
  mounted() {
    this.initializePayment();
  },
  beforeUnmount() {
    // Clean up Adyen checkout instance
    if (this.checkout) {
      this.checkout.unmount();
    }
  },
  methods: {
    async initializePayment() {
      try {
        this.loading = true;
        this.error = null;
        this.paymentResult = null;
        
        // Load Adyen Web SDK
        await this.loadAdyenScript();
        
        // Create payment and get session data
        const response = await axios.post('/api/payments', {
          amount: this.amount,
          currency: this.currency,
          returnUrl: this.returnUrl
        });
        
        this.paymentId = response.data.paymentId;
        const sessionData = response.data.sessionData;
        
        // Initialize Adyen checkout
        this.initializeAdyenCheckout(sessionData);
      } catch (error) {
        console.error('Error initializing payment:', error);
        this.error = 'Failed to initialize payment. Please try again.';
        this.loading = false;
      }
    },
    
    loadAdyenScript() {
      return new Promise((resolve, reject) => {
        if (window.AdyenCheckout) {
          resolve();
          return;
        }
        
        // Load CSS
        const linkElement = document.createElement('link');
        linkElement.rel = 'stylesheet';
        linkElement.href = 'https://checkoutshopper-live.adyen.com/checkoutshopper/sdk/5.31.1/adyen.css';
        document.head.appendChild(linkElement);
        
        // Load JS
        const scriptElement = document.createElement('script');
        scriptElement.src = 'https://checkoutshopper-live.adyen.com/checkoutshopper/sdk/5.31.1/adyen.js';
        scriptElement.integrity = 'sha384-3UOE9xdVx/EyYmBzk7qRz22cZ1Cl6Uv6HnC6uJAGQKxCQZVBcXrv9Rlx0fsPiGo';
        scriptElement.crossOrigin = 'anonymous';
        scriptElement.onload = resolve;
        scriptElement.onerror = reject;
        document.head.appendChild(scriptElement);
      });
    },
    
    initializeAdyenCheckout(sessionData) {
      // Create Adyen checkout instance
      const AdyenCheckout = window.AdyenCheckout;
      
      this.checkout = new AdyenCheckout({
        clientKey: sessionData.clientKey,
        locale: 'de-DE',
        environment: 'test', // Change to 'live' for production
        session: {
          id: sessionData.id,
          sessionData: sessionData.sessionData
        },
        onPaymentCompleted: this.handlePaymentResult,
        onError: this.handleError
      });
      
      // Mount the payment form
      this.checkout.create('card').mount(this.$refs.paymentContainer);
      
      this.loading = false;
    },
    
    async handlePaymentResult(result) {
      try {
        // Send result to backend
        await axios.post(`/api/payments/${this.paymentId}/result`, {
          resultCode: result.resultCode,
          pspReference: result.pspReference
        });
        
        // Show success message
        this.paymentResult = {
          status: 'success',
          message: 'Payment successful!'
        };
      } catch (error) {
        console.error('Error handling payment result:', error);
        this.handleError(error);
      }
    },
    
    handleError(error) {
      console.error('Payment error:', error);
      this.paymentResult = {
        status: 'error',
        message: 'Payment failed. Please try again.'
      };
    },
    
    resetPayment() {
      this.initializePayment();
    },
    
    onContinue() {
      this.$emit('payment-completed', {
        paymentId: this.paymentId
      });
    },
    
    formatPrice(cents) {
      const amount = cents / 100;
      return new Intl.NumberFormat('de-DE', {
        style: 'currency',
        currency: this.currency
      }).format(amount);
    }
  }
};
</script>

<style scoped>
.adyen-payment {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

h2 {
  margin-top: 0;
  margin-bottom: 20px;
  color: #333;
}

.payment-summary {
  margin-bottom: 20px;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 4px;
}

.loading, .error {
  padding: 20px;
  text-align: center;
}

.error {
  color: #e53935;
}

.payment-result {
  margin-top: 20px;
  padding: 15px;
  border-radius: 4px;
  text-align: center;
}

.payment-result.success {
  background-color: #e8f5e9;
  color: #2e7d32;
}

.payment-result.error {
  background-color: #ffebee;
  color: #c62828;
}

button {
  margin-top: 10px;
  padding: 10px 20px;
  background-color: #1976d2;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

button:hover {
  background-color: #1565c0;
}
</style>