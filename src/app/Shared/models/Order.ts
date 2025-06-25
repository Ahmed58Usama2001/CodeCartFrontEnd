export interface Order {
    id: number
    orderDate: string
    buyerEmail: string
    shippingAddress: ShippingAddress
    deliveryMethod: string
    shippingPrice: number
    paymentSummary: PaymentSummary
    orderItems: OrderItem[]
    subtotal: number
    total: number
    orderStatus: string
    paymentIntentId: string
}

export interface ShippingAddress {
    name: string
    line1: string
    line2?: string
    city: string
    postalCode: string
    state: string
    country: string
}

export interface PaymentSummary {
    last4: number
    brand: string
    expMonth: number
    expYear: number
}

export interface OrderItem {
    productId: number
    productName: string
    pictureUrl: string
    price: number
    quantity: number
}

export interface OrderToCreate {
    cartId: string
    paymentSummary: PaymentSummary
    shippingAddress: ShippingAddress
    deliveryMethodId: number
}