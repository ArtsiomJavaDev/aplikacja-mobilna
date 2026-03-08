import type { OrderStatus, CryptoItem, OrderDTO } from '../types';

describe('types', () => {
  it('OrderStatus is string union', () => {
    const s: OrderStatus = 'COMPLETED';
    expect(s).toBe('COMPLETED');
  });

  it('CryptoItem shape', () => {
    const c: CryptoItem = {
      id: '1',
      symbol: 'BTC',
      name: 'Bitcoin',
      marketPrice: 40000,
      sellPrice: 34000,
    };
    expect(c.symbol).toBe('BTC');
  });

  it('OrderDTO shape', () => {
    const o: OrderDTO = {
      id: 1,
      userId: 1,
      userEmail: 'a@b.com',
      currencyCode: 'BTC',
      amount: 0.1,
      totalPrice: 4000,
      status: 'PENDING_PAYMENT',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    };
    expect(o.currencyCode).toBe('BTC');
  });
});
