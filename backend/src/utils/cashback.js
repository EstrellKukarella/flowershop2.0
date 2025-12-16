async function addCashback(supabase, userId, orderId, amount) {
    const cashbackRate = 0.03;
    const cashbackAmount = Math.round(amount * cashbackRate);

    // Start transaction
    const { error } = await supabase.rpc('increment_cashback', {
        p_user_id: userId,
        p_amount: cashbackAmount
    });

    if (error) {
        console.error('Error adding cashback:', error);
        throw error;
    }

    // Record transaction
    await supabase.from('cashback_transactions').insert({
        user_id: userId,
        order_id: orderId,
        amount: cashbackAmount,
        type: 'earned',
        description: `Cashback for order`
    });

    return cashbackAmount;
}

module.exports = { addCashback };
