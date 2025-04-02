// Helper function to calculate late fee
const calculateLateFee = (dueDate, returnDate) => {
    const GRACE_PERIOD_DAYS = 5;
    const LATE_FEE_PER_DAY = 2;
    
    const gracePeriodEnd = new Date(dueDate);
    gracePeriodEnd.setDate(gracePeriodEnd.getDate() + GRACE_PERIOD_DAYS);
    
    if (returnDate <= gracePeriodEnd) return { lateFee: 0, lateDays: 0 };
    
    const lateDays = Math.ceil((returnDate - gracePeriodEnd) / (1000 * 60 * 60 * 24));
    return { lateFee: lateDays * LATE_FEE_PER_DAY, lateDays };
  };