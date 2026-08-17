export interface RoiInputs {
  annualTuition: number;
  annualLivingCost: number;
  years: number;
  startingSalary: number;
}

export function calculateRoi(inputs: RoiInputs) {
  const totalCost = (inputs.annualTuition + inputs.annualLivingCost) * inputs.years;
  const annualRecovery = Math.max(inputs.startingSalary * 0.35, 1);
  return {
    totalCost,
    paybackYears: Math.round((totalCost / annualRecovery) * 10) / 10,
    fiveYearEarnings: Math.round(inputs.startingSalary * 5 * 1.092),
  };
}
