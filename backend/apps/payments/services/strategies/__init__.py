"""
Payment Strategies - Strategy Pattern implementation.
"""
from .base_strategy import PaymentStrategy
from .cash_strategy import CashPaymentStrategy
from .stripe_strategy import StripePaymentStrategy
from .paypal_strategy import PayPalPaymentStrategy


def get_payment_strategy(payment_method):
    """
    Factory function to get the appropriate payment strategy.
    
    Args:
        payment_method: Payment method (CASH, STRIPE, PAYPAL, etc.)
    
    Returns:
        PaymentStrategy: Appropriate strategy instance
    
    Raises:
        ValueError: If payment method is not supported
    """
    strategies = {
        'CASH': CashPaymentStrategy,
        'CREDIT_CARD': CashPaymentStrategy,  # Handled manually like cash
        'DEBIT_CARD': CashPaymentStrategy,   # Handled manually like cash
        'STRIPE': StripePaymentStrategy,
        'PAYPAL': PayPalPaymentStrategy,
        'BANK_TRANSFER': CashPaymentStrategy,  # Handled manually
        'CCP': CashPaymentStrategy,  # Handled manually
    }
    
    strategy_class = strategies.get(payment_method)
    if not strategy_class:
        raise ValueError(f"Méthode de paiement non supportée: {payment_method}")
    
    return strategy_class()


__all__ = [
    'PaymentStrategy',
    'CashPaymentStrategy',
    'StripePaymentStrategy',
    'PayPalPaymentStrategy',
    'get_payment_strategy',
]