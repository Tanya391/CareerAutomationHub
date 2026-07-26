export function formatSalaryToLPA(rawSalary) {
  if (!rawSalary || isNaN(rawSalary)) {
    return 'N/A';
  }

  // If rawSalary is provided in standard INR (e.g., 1200000)
  if (rawSalary >= 100000) {
    const lpa = rawSalary / 100000;
    // Format to 1 decimal place if needed, removing trailing .0
    const formatted = Number.isInteger(lpa) ? lpa.toFixed(0) : lpa.toFixed(1);
    return `${formatted} LPA`;
  }

  // Fallback if provided directly as LPA (e.g. 12)
  return `${rawSalary} LPA`;
}
