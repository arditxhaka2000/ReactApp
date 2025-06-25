// OrderView.jsx - Fixed Version
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, Truck, CheckCircle, Clock, MapPin, CreditCard, RotateCcw, Mail, Phone } from 'lucide-react';
import './OrderView.css';

const OrderView = () => {
    const { orderNumber } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchOrderDetails();
    }, [orderNumber]);

    const fetchOrderDetails = async () => {
        try {
            setLoading(true);
            const response = await fetch(`https://localhost:7100/api/orders/${orderNumber}`);

            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error('Order not found');
                } else {
                    throw new Error('Failed to fetch order details');
                }
            }

            const data = await response.json();
            setOrder(data);
            setError(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const getStatusIcon = (status) => {
        switch (status?.toLowerCase()) {
            case 'pending':
                return <Clock className="status-icon pending" />;
            case 'processing':
                return <Package className="status-icon processing" />;
            case 'shipped':
                return <Truck className="status-icon shipped" />;
            case 'delivered':
                return <CheckCircle className="status-icon delivered" />;
            case 'cancelled':
                return <RotateCcw className="status-icon cancelled" />;
            default:
                return <Clock className="status-icon" />;
        }
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'pending': return '#f59e0b';
            case 'processing': return '#3b82f6';
            case 'shipped': return '#8b5cf6';
            case 'delivered': return '#10b981';
            case 'cancelled': return '#ef4444';
            default: return '#6b7280';
        }
    };

    const getPaymentStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'paid': return '#10b981';
            case 'pending': return '#f59e0b';
            case 'failed': return '#ef4444';
            case 'refunded': return '#6b7280';
            default: return '#6b7280';
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getTrackingSteps = () => {
        if (!order) return [];

        const steps = [
            {
                key: 'processing',
                label: 'Order Confirmed',
                completed: true,
                date: order.orderDate
            },
            {
                key: 'shipped',
                label: 'Shipped',
                completed: ['shipped', 'delivered'].includes(order.status?.toLowerCase()),
                date: order.shippedDate
            },
            {
                key: 'delivered',
                label: 'Delivered',
                completed: order.status?.toLowerCase() === 'delivered',
                date: order.deliveredDate
            }
        ];
        return steps;
    };

    if (loading) {
        return (
            <div className="order-view-container">
                <div className="loading-state">
                    <div className="loading-spinner"></div>
                    <p>Loading order details...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="order-view-container">
                <div className="error-state">
                    <div className="error-icon">⚠️</div>
                    <h2>Order Not Found</h2>
                    <p>{error}</p>
                    <button onClick={() => navigate('/')} className="back-home-btn">
                        Back to Home
                    </button>
                </div>
            </div>
        );
    }

    if (!order) {
        return null;
    }

    return (
        <div className="order-view-container">
            {/* Header */}
            <div className="order-header">
                <button onClick={() => navigate(-1)} className="back-button">
                    <ArrowLeft size={20} />
                    Back
                </button>
                <div className="order-title">
                    <h1>Order #{order.orderNumber}</h1>
                    <p className="order-date">Placed on {formatDate(order.orderDate)}</p>
                </div>
                <div className="order-status-badge">
                    {getStatusIcon(order.status)}
                    <span style={{ color: getStatusColor(order.status) }}>
                        {order.status}
                    </span>
                </div>
            </div>

            <div className="order-content">
                {/* Order Progress */}
                <div className="order-section">
                    <h2>Order Progress</h2>
                    <div className="tracking-timeline">
                        {getTrackingSteps().map((step, index) => (
                            <div key={step.key} className={`tracking-step ${step.completed ? 'completed' : ''}`}>
                                <div className="step-indicator">
                                    {step.completed ? (
                                        <CheckCircle size={24} />
                                    ) : (
                                        <div className="step-circle"></div>
                                    )}
                                </div>
                                <div className="step-content">
                                    <h4>{step.label}</h4>
                                    {step.date && step.completed && (
                                        <p>{formatDate(step.date)}</p>
                                    )}
                                </div>
                                {index < getTrackingSteps().length - 1 && (
                                    <div className={`step-connector ${step.completed ? 'completed' : ''}`}></div>
                                )}
                            </div>
                        ))}
                    </div>

                    {order.trackingNumber && (
                        <div className="tracking-info">
                            <div className="tracking-number">
                                <Truck size={20} />
                                <div>
                                    <h4>Tracking Number</h4>
                                    <p>{order.trackingNumber}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="order-grid">
                    {/* Order Items */}
                    <div className="order-section">
                        <h2>Order Items ({order.items?.length || 0})</h2>
                        <div className="order-items">
                            {order.items?.map((item, index) => (
                                <div key={item.id || index} className="order-item">
                                    <div className="item-image">
                                        <img
                                            src={item.imageUrl || '/api/placeholder/80/100'}
                                            alt={item.productName || 'Product'}
                                            onError={(e) => {
                                                e.target.src = '/api/placeholder/80/100';
                                            }}
                                        />
                                    </div>
                                    <div className="item-details">
                                        <h4>{item.productName || 'Unknown Product'}</h4>
                                        {item.productColor && <p>Color: {item.productColor}</p>}
                                        {item.sizeName && <p>Size: {item.sizeName}</p>}
                                        <p>Quantity: {item.quantity || 1}</p>
                                        <div className="item-pricing">
                                            <span className="unit-price">
                                                £{(item.unitPrice || 0).toFixed(2)} each
                                            </span>
                                            <span className="total-price">
                                                £{(item.totalPrice || item.unitPrice * item.quantity || 0).toFixed(2)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Order Summary */}
                        <div className="order-summary">
                            <div className="summary-line">
                                <span>Subtotal:</span>
                                <span>£{(order.subtotal || 0).toFixed(2)}</span>
                            </div>
                            <div className="summary-line">
                                <span>Shipping:</span>
                                <span>
                                    {(order.shippingCost || 0) === 0
                                        ? 'Free'
                                        : `£${order.shippingCost.toFixed(2)}`
                                    }
                                </span>
                            </div>
                            {order.discount && order.discount > 0 && (
                                <div className="summary-line discount">
                                    <span>Discount:</span>
                                    <span>-£{order.discount.toFixed(2)}</span>
                                </div>
                            )}
                            {order.tax && order.tax > 0 && (
                                <div className="summary-line">
                                    <span>Tax:</span>
                                    <span>£{order.tax.toFixed(2)}</span>
                                </div>
                            )}
                            <div className="summary-line total">
                                <span>Total:</span>
                                <span>£{(order.total || 0).toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Order Information */}
                    <div className="order-sidebar">
                        {/* Customer Information */}
                        <div className="info-section">
                            <h3>Customer Information</h3>
                            {order.customerEmail && (
                                <div className="info-item">
                                    <Mail size={16} />
                                    <div>
                                        <p className="info-label">Email</p>
                                        <p className="info-value">{order.customerEmail}</p>
                                    </div>
                                </div>
                            )}
                            {order.shippingAddress?.phone && (
                                <div className="info-item">
                                    <Phone size={16} />
                                    <div>
                                        <p className="info-label">Phone</p>
                                        <p className="info-value">{order.shippingAddress.phone}</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Shipping Address */}
                        {order.shippingAddress && (
                            <div className="info-section">
                                <h3>
                                    <MapPin size={18} />
                                    Shipping Address
                                </h3>
                                <div className="address-details">
                                    {(order.shippingAddress.firstName || order.shippingAddress.lastName) && (
                                        <p>
                                            {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                                        </p>
                                    )}
                                    {order.shippingAddress.addressLine1 && (
                                        <p>{order.shippingAddress.addressLine1}</p>
                                    )}
                                    {order.shippingAddress.addressLine2 && (
                                        <p>{order.shippingAddress.addressLine2}</p>
                                    )}
                                    {(order.shippingAddress.city || order.shippingAddress.state) && (
                                        <p>
                                            {order.shippingAddress.city}
                                            {order.shippingAddress.city && order.shippingAddress.state && ', '}
                                            {order.shippingAddress.state}
                                        </p>
                                    )}
                                    {order.shippingAddress.postalCode && (
                                        <p>{order.shippingAddress.postalCode}</p>
                                    )}
                                    {order.shippingAddress.country && (
                                        <p>{order.shippingAddress.country}</p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Payment Information */}
                        <div className="info-section">
                            <h3>
                                <CreditCard size={18} />
                                Payment Information
                            </h3>
                            {order.paymentStatus && (
                                <div className="payment-status">
                                    <span
                                        className="payment-badge"
                                        style={{ backgroundColor: getPaymentStatusColor(order.paymentStatus) }}
                                    >
                                        {order.paymentStatus}
                                    </span>
                                </div>
                            )}
                            <p className="payment-method">Payment Method: Card</p>
                        </div>

                        {/* Order Actions */}
                        <div className="order-actions">
                            <button className="action-btn secondary" onClick={() => window.print()}>
                                Print Order
                            </button>
                            <button
                                className="action-btn primary"
                                onClick={() => navigate('/')}
                            >
                                Continue Shopping
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderView;