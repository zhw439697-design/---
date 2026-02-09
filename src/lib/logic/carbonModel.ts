// Carbon Emission Model Logic

/**
 * Constants for Carbon Emissions (kg CO2e / kWh)
 * Based on industry benchmarks for NMC and LFP batteries.
 */
export const EMISSION_FACTORS = {
    manufacturing: 100, // kg CO2e/kWh for new battery production
    recyclingReduction: 30, // kg CO2e/kWh saved by recycling
    logistics: 5, // kg CO2e/kWh for transport
};

/**
 * Calculate total system cost including Carbon Tax
 * @param recyclingRate - Percentage of batteries recycled (0-1)
 * @param carbonTax - Tax per kg of CO2 emissions ($/ton converted to $/kg)
 * @param volume - Total waste volume in kWh
 */
export function calculateSystemCost(
    recyclingRate: number,
    carbonTax: number,
    volume: number
) {
    // Base operational cost (simplified function)
    const operationalCost = volume * (10 + 5 * recyclingRate);

    // Emissions Calculation
    const avoidedEmissions = volume * recyclingRate * EMISSION_FACTORS.recyclingReduction;
    const logisticsEmissions = volume * EMISSION_FACTORS.logistics;
    const netEmissions = (volume * EMISSION_FACTORS.manufacturing) - avoidedEmissions + logisticsEmissions;

    // Tax Cost
    const taxCost = (netEmissions / 1000) * carbonTax; // carbonTax is usually per Ton

    return {
        totalCost: operationalCost + taxCost,
        operationalCost,
        taxCost,
        netEmissions
    };
}

/**
 * Generate Sensitivity Analysis Data
 * Varies Carbon Tax from 0 to maxTax to see impact on Total Cost and optimal Recycling Rate.
 */
export function runCarbonTaxSensitivity(volume: number, maxTax: number = 100) {
    const data = [];

    for (let tax = 0; tax <= maxTax; tax += 10) {
        // Assume higher tax incentivizes higher recycling (mock logic)
        // In reality, this would be an optimization solver result.
        // We simulate the "Optimal Recycling Rate" increasing with tax.
        let optimalRecyclingRate = 0.2 + (tax / maxTax) * 0.7;
        if (optimalRecyclingRate > 0.95) optimalRecyclingRate = 0.95;

        const result = calculateSystemCost(optimalRecyclingRate, tax, volume);

        data.push({
            tax,
            recyclingRate: parseFloat(optimalRecyclingRate.toFixed(2)),
            cost: parseFloat(result.totalCost.toFixed(2)),
            emissions: parseFloat(result.netEmissions.toFixed(2))
        });
    }

    return data;
}
