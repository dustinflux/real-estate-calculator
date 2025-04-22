import React, { useState, useEffect, useRef } from 'react';

function RealEstateCalculator() {
  const [reportStatus, setReportStatus] = useState({
    loading: false,
    success: false,
    error: null
  });
  
  const reportRef = useRef(null);

  const [formData, setFormData] = useState({
    purchasePrice: '',
    arv: '',
    arvPercentageGoal: '70',
    cashToSeller: '',
    arrears: '',
    acquisitionCost: '',
    assignmentFee: '',
    closingCost: '',
    rehab: '',
    holdingCosts: '',
    marketing: '',
    rentalIncome: '',
    equityToSeller: '',
    pmlCost: '',
    piti: '',
    warChest: '',
    insurance: '',
    taxes: '',
    otherExpenses: ''
  });

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedData = localStorage.getItem('realEstateCalculatorData');
    if (savedData) {
      setFormData(JSON.parse(savedData));
    }
  }, []);

  // Save data to localStorage whenever form data changes
  useEffect(() => {
    localStorage.setItem('realEstateCalculatorData', JSON.stringify(formData));
  }, [formData]);

  const updateField = (field, value) => {
    setFormData({
      ...formData,
      [field]: value
    });
  };
  
  // Reset form function
  const resetForm = () => {
    setFormData({
      purchasePrice: '',
      arv: '',
      arvPercentageGoal: '70',
      cashToSeller: '',
      arrears: '',
      acquisitionCost: '',
      assignmentFee: '',
      closingCost: '',
      rehab: '',
      holdingCosts: '',
      marketing: '',
      rentalIncome: '',
      equityToSeller: '',
      pmlCost: '',
      piti: '',
      warChest: '',
      insurance: '',
      taxes: '',
      otherExpenses: ''
    });
    
    // Also clear localStorage when resetting
    localStorage.removeItem('realEstateCalculatorData');
  };
  
  // Calculate total entry fee
  const totalEntryFee = 
    parseFloat(formData.cashToSeller || 0) + 
    parseFloat(formData.arrears || 0) + 
    parseFloat(formData.acquisitionCost || 0) + 
    parseFloat(formData.assignmentFee || 0) + 
    parseFloat(formData.closingCost || 0) + 
    parseFloat(formData.rehab || 0) + 
    parseFloat(formData.holdingCosts || 0) + 
    parseFloat(formData.marketing || 0);
  
  const purchasePrice = parseFloat(formData.purchasePrice || 0);
  const arv = parseFloat(formData.arv || 0);
  const arvPercentageGoal = parseFloat(formData.arvPercentageGoal || 70);
  
  // Assignment fee directly impacts all calculations
  const assignmentFeeValue = parseFloat(formData.assignmentFee || 0);
  
  // Include assignment fee in totalInvestment calculation
  const totalInvestment = purchasePrice + parseFloat(formData.rehab || 0) + assignmentFeeValue;
  const actualArvPercentage = arv > 0 ? (totalInvestment / arv) * 100 : 0;
  
  // Determine if the deal meets ARV goals
  const meetsArvGoal = actualArvPercentage <= arvPercentageGoal;
  const arvMessage = meetsArvGoal ? 
    "More room for profit" : 
    "Must reduce to hit Percentage of ARV Goal";
  
  // Standard PML rates
  const pmlAt8 = totalEntryFee * 0.08 / 12;
  const pmlAt10 = totalEntryFee * 0.10 / 12;
  const pmlAt12 = totalEntryFee * 0.12 / 12;
  
  // Calculate monthly expenses
  const monthlyExpenses = 
    parseFloat(formData.equityToSeller || 0) + 
    parseFloat(formData.pmlCost || 0) + 
    parseFloat(formData.piti || 0) + 
    parseFloat(formData.warChest || 0) + 
    parseFloat(formData.insurance || 0) + 
    parseFloat(formData.taxes || 0) + 
    parseFloat(formData.otherExpenses || 0);
  
  // Calculate cash flow
  const monthlyCashFlow = parseFloat(formData.rentalIncome || 0) - monthlyExpenses;
  const yearlyNOI = monthlyCashFlow * 12;
  
  // ROI calculations
  const cashOnCashReturn = totalEntryFee > 0 ? (yearlyNOI / totalEntryFee) * 100 : 0;
  
  // Calculate yield
  const annualRent = parseFloat(formData.rentalIncome || 0) * 12;
  const purchasePlusRehab = purchasePrice + parseFloat(formData.rehab || 0) + assignmentFeeValue;
  const yield_ = purchasePlusRehab > 0 ? (annualRent / purchasePlusRehab) * 100 : 0;
  
  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(value);
  };
  
  // Format percent
  const formatPercent = (value) => {
    return value.toFixed(2) + '%';
  };
  
  // Get deal grades
  const getLTRDealGrade = (roi) => {
    if (roi >= 15) return "✅ Excellent";
    if (roi >= 10) return "🟢 Good";
    if (roi >= 8) return "⚠️ Fair";
    return "❌ Poor";
  };
  
  const getSTRDealGrade = (roi) => {
    if (roi >= 25) return "✅ Excellent";
    if (roi >= 18) return "🟢 Good";
    if (roi >= 15) return "⚠️ Fair";
    return "❌ Poor";
  };
  
  const getWholesaleDealGrade = (assignmentFee) => {
    if (assignmentFee >= 15000) return "✅ Excellent";
    if (assignmentFee >= 10000) return "🟢 Good";
    if (assignmentFee >= 5000) return "⚠️ Fair";
    return "❌ Low End";
  };
  
  const getWholesaleProgressPercentage = (assignmentFee) => {
    return Math.min(100, Math.max(0, assignmentFee / 20000 * 100));
  };

  // Function to generate an HTML report and download it
  const exportReport = () => {
    setReportStatus({
      loading: true,
      success: false,
      error: null
    });
    
    try {
      // Create report content
      const reportTitle = "Real Estate Deal Analysis";
      const date = new Date().toLocaleDateString();
      
      // Generate HTML content for the report
      const reportContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${reportTitle}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 800px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 2px solid #003366;
              padding-bottom: 10px;
            }
            h1 {
              color: #003366;
              margin-bottom: 5px;
            }
            .date {
              color: #666;
              font-size: 14px;
              margin-bottom: 20px;
            }
            .section {
              margin-bottom: 30px;
            }
            .section-title {
              color: #003366;
              border-bottom: 1px solid #ddd;
              padding-bottom: 5px;
              margin-bottom: 15px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
            }
            th {
              background-color: #003366;
              color: white;
              text-align: left;
              padding: 10px;
            }
            td {
              border: 1px solid #ddd;
              padding: 10px;
            }
            tr:nth-child(even) {
              background-color: #f2f2f2;
            }
            .footer {
              text-align: center;
              font-size: 12px;
              color: #999;
              margin-top: 40px;
              border-top: 1px solid #ddd;
              padding-top: 10px;
            }
            .grade-excellent {
              color: #10B981;
              font-weight: bold;
            }
            .grade-good {
              color: #34D399;
              font-weight: bold;
            }
            .grade-fair {
              color: #FBBF24;
              font-weight: bold;
            }
            .grade-poor {
              color: #EF4444;
              font-weight: bold;
            }
            .arv-status {
              padding: 8px;
              border-radius: 4px;
              display: inline-block;
              margin-top: 10px;
            }
            .arv-success {
              background-color: #d1fae5;
              color: #065f46;
            }
            .arv-fail {
              background-color: #fee2e2;
              color: #991b1b;
            }
            @media print {
              body {
                padding: 0;
                font-size: 12px;
              }
              .no-print {
                display: none;
              }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${reportTitle}</h1>
            <div class="date">Generated on: ${date}</div>
          </div>
          
          <div class="section">
            <h2 class="section-title">Property Information</h2>
            <table>
              <tr>
                <th>Item</th>
                <th>Value</th>
              </tr>
              <tr>
                <td>Purchase Price</td>
                <td>${formatCurrency(purchasePrice)}</td>
              </tr>
              <tr>
                <td>After Repair Value (ARV)</td>
                <td>${formatCurrency(arv)}</td>
              </tr>
              <tr>
                <td>ARV Percentage Goal</td>
                <td>${formatPercent(arvPercentageGoal)}</td>
              </tr>
              <tr>
                <td>Actual ARV Percentage</td>
                <td>${formatPercent(actualArvPercentage)}</td>
              </tr>
            </table>
            
            <div class="arv-status ${meetsArvGoal ? 'arv-success' : 'arv-fail'}">
              ${meetsArvGoal ? '✓ Meets ARV Goal' : '✗ Does Not Meet ARV Goal'}: ${arvMessage}
            </div>
          </div>
          
          <div class="section">
            <h2 class="section-title">Entry Fee Breakdown</h2>
            <table>
              <tr>
                <th>Item</th>
                <th>Amount</th>
              </tr>
              <tr>
                <td>Cash to Seller</td>
                <td>${formatCurrency(parseFloat(formData.cashToSeller || 0))}</td>
              </tr>
              <tr>
                <td>Arrears</td>
                <td>${formatCurrency(parseFloat(formData.arrears || 0))}</td>
              </tr>
              <tr>
                <td>Acquisition Cost</td>
                <td>${formatCurrency(parseFloat(formData.acquisitionCost || 0))}</td>
              </tr>
              <tr>
                <td>Assignment Fee</td>
                <td>${formatCurrency(parseFloat(formData.assignmentFee || 0))}</td>
              </tr>
              <tr>
                <td>Closing Cost</td>
                <td>${formatCurrency(parseFloat(formData.closingCost || 0))}</td>
              </tr>
              <tr>
                <td>Rehab</td>
                <td>${formatCurrency(parseFloat(formData.rehab || 0))}</td>
              </tr>
              <tr>
                <td>Holding Costs</td>
                <td>${formatCurrency(parseFloat(formData.holdingCosts || 0))}</td>
              </tr>
              <tr>
                <td>Marketing</td>
                <td>${formatCurrency(parseFloat(formData.marketing || 0))}</td>
              </tr>
              <tr style="font-weight: bold; background-color: #f0f8ff;">
                <td>Total Entry Fee</td>
                <td>${formatCurrency(totalEntryFee)}</td>
              </tr>
            </table>
          </div>
          
          <div class="section">
            <h2 class="section-title">PML Calculations</h2>
            <table>
              <tr>
                <th>Rate</th>
                <th>Monthly Amount</th>
              </tr>
              <tr>
                <td>Monthly PML at 8%</td>
                <td>${formatCurrency(pmlAt8)}</td>
              </tr>
              <tr>
                <td>Monthly PML at 10%</td>
                <td>${formatCurrency(pmlAt10)}</td>
              </tr>
              <tr>
                <td>Monthly PML at 12%</td>
                <td>${formatCurrency(pmlAt12)}</td>
              </tr>
            </table>
          </div>
          
          <div class="section">
            <h2 class="section-title">Cash Flow Analysis</h2>
            <table>
              <tr>
                <th>Item</th>
                <th>Amount</th>
              </tr>
              <tr>
                <td>Monthly Rental Income</td>
                <td>${formatCurrency(parseFloat(formData.rentalIncome || 0))}</td>
              </tr>
              <tr>
                <td>Monthly Equity to Seller</td>
                <td>${formatCurrency(parseFloat(formData.equityToSeller || 0))}</td>
              </tr>
              <tr>
                <td>Monthly PML Cost</td>
                <td>${formatCurrency(parseFloat(formData.pmlCost || 0))}</td>
              </tr>
              <tr>
                <td>Monthly PITI</td>
                <td>${formatCurrency(parseFloat(formData.piti || 0))}</td>
              </tr>
              <tr>
                <td>War Chest</td>
                <td>${formatCurrency(parseFloat(formData.warChest || 0))}</td>
              </tr>
              <tr>
                <td>Insurance</td>
                <td>${formatCurrency(parseFloat(formData.insurance || 0))}</td>
              </tr>
              <tr>
                <td>Taxes</td>
                <td>${formatCurrency(parseFloat(formData.taxes || 0))}</td>
              </tr>
              <tr>
                <td>Other Expenses</td>
                <td>${formatCurrency(parseFloat(formData.otherExpenses || 0))}</td>
              </tr>
              <tr style="font-weight: bold; background-color: #f0f8ff;">
                <td>Total Monthly Expenses</td>
                <td>${formatCurrency(monthlyExpenses)}</td>
              </tr>
              <tr style="font-weight: bold; background-color: #f0f8ff;">
                <td>Monthly Cash Flow</td>
                <td>${formatCurrency(monthlyCashFlow)}</td>
              </tr>
              <tr style="font-weight: bold; background-color: #f0f8ff;">
                <td>Yearly NOI</td>
                <td>${formatCurrency(yearlyNOI)}</td>
              </tr>
              <tr style="font-weight: bold; background-color: #f0f8ff;">
                <td>Cash on Cash Return</td>
                <td>${formatPercent(cashOnCashReturn)}</td>
              </tr>
              <tr style="font-weight: bold; background-color: #f0f8ff;">
                <td>Yield</td>
                <td>${formatPercent(yield_)}</td>
              </tr>
            </table>
          </div>
          
          <div class="section">
            <h2 class="section-title">Deal Grade by Strategy</h2>
            <table>
              <tr>
                <th>Strategy</th>
                <th>Grade</th>
              </tr>
              <tr>
                <td>Wholesale Deal</td>
                <td class="${
                  assignmentFeeValue >= 15000 ? 'grade-excellent' : 
                  assignmentFeeValue >= 10000 ? 'grade-good' : 
                  assignmentFeeValue >= 5000 ? 'grade-fair' : 
                  'grade-poor'
                }">${getWholesaleDealGrade(assignmentFeeValue)}</td>
              </tr>
              <tr>
                <td>Long-Term Rental</td>
                <td class="${
                  cashOnCashReturn >= 15 ? 'grade-excellent' : 
                  cashOnCashReturn >= 10 ? 'grade-good' : 
                  cashOnCashReturn >= 8 ? 'grade-fair' : 
                  'grade-poor'
                }">${getLTRDealGrade(cashOnCashReturn)}</td>
              </tr>
              <tr>
                <td>Short-Term Rental</td>
                <td class="${
                  cashOnCashReturn >= 25 ? 'grade-excellent' : 
                  cashOnCashReturn >= 18 ? 'grade-good' : 
                  cashOnCashReturn >= 15 ? 'grade-fair' : 
                  'grade-poor'
                }">${getSTRDealGrade(cashOnCashReturn)}</td>
              </tr>
            </table>
          </div>
          
          <div class="no-print">
            <button onclick="window.print()" style="background-color: #003366; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; font-size: 16px;">
              Print Report
            </button>
          </div>
          
          <div class="footer">
            Real Estate Deal Calculator - Confidential
          </div>
        </body>
        </html>
      `;
      
      // Create a blob from the HTML content
      const blob = new Blob([reportContent], { type: 'text/html' });
      
      // Create a URL for the blob
      const url = URL.createObjectURL(blob);
      
      // Create a temporary link element
      const link = document.createElement('a');
      link.href = url;
      link.download = 'Real_Estate_Deal_Analysis.html';
      
      // Simulate a click to trigger the download
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      setReportStatus({
        loading: false,
        success: true,
        error: null
      });
      
      // Reset success message after 3 seconds
      setTimeout(() => {
        setReportStatus(prev => ({
          ...prev,
          success: false
        }));
      }, 3000);
      
    } catch (error) {
      setReportStatus({
        loading: false,
        success: false,
        error: error.message || "Failed to generate report"
      });
    }
  };

  return (
    <div className="bg-gray-900 text-white p-5">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-5">
          <h1 className="text-2xl font-bold">Real Estate Deal Calculator</h1>
          <div className="flex gap-2">
            <button 
              onClick={resetForm}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded"
            >
              Reset Fields
            </button>
            <button 
              onClick={exportReport}
              disabled={reportStatus.loading}
              className={`px-4 py-2 ${reportStatus.loading 
                ? 'bg-blue-400' 
                : 'bg-blue-600 hover:bg-blue-700'} text-white rounded flex items-center gap-2`}
            >
              {reportStatus.loading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating Report...
                </>
              ) : (
                <>
                  <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Export Report
                </>
              )}
            </button>
          </div>
        </div>
        
        {/* Status Messages */}
        {reportStatus.error && (
          <div className="mb-4 p-3 bg-red-800 text-white rounded">
            Error: {reportStatus.error}
          </div>
        )}
        
        {reportStatus.success && (
          <div className="mb-4 p-3 bg-green-800 text-white rounded">
            Report successfully generated and downloaded!
          </div>
        )}
        
        {/* Deal Information Note */}
        <div className="mb-5 p-4 bg-blue-900 text-white rounded">
          <h3 className="font-semibold mb-2 flex items-center">
            <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Deal Information
          </h3>
          <p className="text-sm">
            Fill in the fields below to analyze your real estate deal. Once complete, click "Export Report" to download a detailed report.
          </p>
        </div>
        
        {/* Purchase Info */}
        <div className="mb-5 p-4 bg-gray-800 rounded">
          <h2 className="mb-3 text-xl font-semibold border-b border-gray-700 pb-2">
            Purchase Information
          </h2>
          
          <div className="flex flex-wrap gap-4">
            <div className="min-w-64 flex-1">
              <label className="block mb-1">Purchase Price</label>
              <input
                type="text"
                value={formData.purchasePrice}
                onChange={(e) => updateField('purchasePrice', e.target.value)}
                className="w-full p-2 bg-green-200 text-gray-900 rounded"
                placeholder="0"
              />
            </div>
            
            <div className="min-w-64 flex-1">
              <label className="block mb-1">ARV</label>
              <input
                type="text"
                value={formData.arv}
                onChange={(e) => updateField('arv', e.target.value)}
                className="w-full p-2 bg-green-200 text-gray-900 rounded"
                placeholder="0"
              />
            </div>
            
            <div className="min-w-64 flex-1">
              <label className="block mb-1">Buyer ARV % Goal</label>
              <input
                type="text"
                value={formData.arvPercentageGoal}
                onChange={(e) => updateField('arvPercentageGoal', e.target.value)}
                className="w-full p-2 bg-green-200 text-gray-900 rounded"
                placeholder="70"
              />
            </div>
          </div>
        </div>
        
        {/* Entry Fee Section */}
        <div className="mb-5 p-4 bg-gray-800 rounded">
          <h2 className="mb-3 text-xl font-semibold border-b border-gray-700 pb-2">
            Entry Fee Breakdown
          </h2>
          
          <div className="flex flex-wrap gap-4">
            <div className="min-w-64 flex-1">
              <label className="block mb-1">Cash to Seller</label>
              <input
                type="text"
                value={formData.cashToSeller}
                onChange={(e) => updateField('cashToSeller', e.target.value)}
                className="w-full p-2 bg-green-200 text-gray-900 rounded"
                placeholder="0"
              />
            </div>
            
            <div className="min-w-64 flex-1">
              <label className="block mb-1">Arrears</label>
              <input
                type="text"
                value={formData.arrears}
                onChange={(e) => updateField('arrears', e.target.value)}
                className="w-full p-2 bg-green-200 text-gray-900 rounded"
                placeholder="0"
              />
            </div>
            
            <div className="min-w-64 flex-1">
              <label className="block mb-1">Acquisition Cost</label>
              <input
                type="text"
                value={formData.acquisitionCost}
                onChange={(e) => updateField('acquisitionCost', e.target.value)}
                className="w-full p-2 bg-green-200 text-gray-900 rounded"
                placeholder="0"
              />
            </div>
            
            <div className="min-w-64 flex-1">
              <label className="block mb-1">Assignment Fee</label>
              <input
                type="text"
                value={formData.assignmentFee}
                onChange={(e) => updateField('assignmentFee', e.target.value)}
                className="w-full p-2 bg-green-200 text-gray-900 rounded"
                placeholder="0"
              />
            </div>
            
            <div className="min-w-64 flex-1">
              <label className="block mb-1">Closing Cost</label>
              <input
                type="text"
                value={formData.closingCost}
                onChange={(e) => updateField('closingCost', e.target.value)}
                className="w-full p-2 bg-green-200 text-gray-900 rounded"
                placeholder="0"
              />
            </div>
            
            <div className="min-w-64 flex-1">
              <label className="block mb-1">Rehab</label>
              <input
                type="text"
                value={formData.rehab}
                onChange={(e) => updateField('rehab', e.target.value)}
                className="w-full p-2 bg-green-200 text-gray-900 rounded"
                placeholder="0"
              />
            </div>
            
            <div className="min-w-64 flex-1">
              <label className="block mb-1">Holding Costs</label>
              <input
                type="text"
                value={formData.holdingCosts}
                onChange={(e) => updateField('holdingCosts', e.target.value)}
                className="w-full p-2 bg-green-200 text-gray-900 rounded"
                placeholder="0"
              />
            </div>
            
            <div className="min-w-64 flex-1">
              <label className="block mb-1">Marketing</label>
              <input
                type="text"
                value={formData.marketing}
                onChange={(e) => updateField('marketing', e.target.value)}
                className="w-full p-2 bg-green-200 text-gray-900 rounded"
                placeholder="0"
              />
            </div>
          </div>
        </div>
        
        {/* Entry Fee Calculations */}
        <div className="mb-5 p-4 bg-gray-800 rounded">
          <h2 className="mb-3 text-xl font-semibold border-b border-gray-700 pb-2">
            Entry Fee Calculations
          </h2>
          
          <div className="flex flex-wrap gap-4">
            <div className="min-w-64 flex-1">
              <label className="block mb-1 font-semibold text-yellow-400">Total Entry Fee</label>
              <div className="w-full p-2 bg-gray-700 text-white rounded">
                {formatCurrency(totalEntryFee)}
              </div>
            </div>
            
            <div className="min-w-64 flex-1">
              <label className="block mb-1">Monthly PML at 8%</label>
              <div className="w-full p-2 bg-gray-700 text-white rounded">
                {formatCurrency(pmlAt8)}
              </div>
            </div>
            
            <div className="min-w-64 flex-1">
              <label className="block mb-1">Monthly PML at 10%</label>
              <div className="w-full p-2 bg-gray-700 text-white rounded">
                {formatCurrency(pmlAt10)}
              </div>
            </div>
            
            <div className="min-w-64 flex-1">
              <label className="block mb-1">Monthly PML at 12%</label>
              <div className="w-full p-2 bg-gray-700 text-white rounded">
                {formatCurrency(pmlAt12)}
              </div>
            </div>
          </div>
        </div>
        
        {/* Cash Flow Section */}
        <div className="mb-5 p-4 bg-gray-800 rounded">
          <h2 className="mb-3 text-xl font-semibold border-b border-gray-700 pb-2">
            Cash Flow Calculation
          </h2>
          
          <div className="flex flex-wrap gap-4">
            <div className="min-w-64 flex-1">
              <label className="block mb-1">Monthly Rental Income</label>
              <input
                type="text"
                value={formData.rentalIncome}
                onChange={(e) => updateField('rentalIncome', e.target.value)}
                className="w-full p-2 bg-green-200 text-gray-900 rounded"
                placeholder="0"
              />
            </div>
            
            <div className="min-w-64 flex-1">
              <label className="block mb-1">Monthly Equity to Seller</label>
              <input
                type="text"
                value={formData.equityToSeller}
                onChange={(e) => updateField('equityToSeller', e.target.value)}
                className="w-full p-2 bg-green-200 text-gray-900 rounded"
                placeholder="0"
              />
            </div>
            
            <div className="min-w-64 flex-1">
              <label className="block mb-1">Monthly PML Cost</label>
              <input
                type="text"
                value={formData.pmlCost}
                onChange={(e) => updateField('pmlCost', e.target.value)}
                className="w-full p-2 bg-green-200 text-gray-900 rounded"
                placeholder="0"
              />
            </div>
            
            <div className="min-w-64 flex-1">
              <label className="block mb-1">Monthly PITI</label>
              <input
                type="text"
                value={formData.piti}
                onChange={(e) => updateField('piti', e.target.value)}
                className="w-full p-2 bg-green-200 text-gray-900 rounded"
                placeholder="0"
              />
            </div>
            
            <div className="min-w-64 flex-1">
              <label className="block mb-1">War Chest</label>
              <input
                type="text"
                value={formData.warChest}
                onChange={(e) => updateField('warChest', e.target.value)}
                className="w-full p-2 bg-green-200 text-gray-900 rounded"
                placeholder="0"
              />
            </div>
            
            <div className="min-w-64 flex-1">
              <label className="block mb-1">Insurance</label>
              <input
                type="text"
                value={formData.insurance}
                onChange={(e) => updateField('insurance', e.target.value)}
                className="w-full p-2 bg-green-200 text-gray-900 rounded"
                placeholder="0"
              />
            </div>
            
            <div className="min-w-64 flex-1">
              <label className="block mb-1">Taxes</label>
              <input
                type="text"
                value={formData.taxes}
                onChange={(e) => updateField('taxes', e.target.value)}
                className="w-full p-2 bg-green-200 text-gray-900 rounded"
                placeholder="0"
              />
            </div>
            
            <div className="min-w-64 flex-1">
              <label className="block mb-1">Other Expenses</label>
              <input
                type="text"
                value={formData.otherExpenses}
                onChange={(e) => updateField('otherExpenses', e.target.value)}
                className="w-full p-2 bg-green-200 text-gray-900 rounded"
                placeholder="0"
              />
            </div>
            
            <div className="min-w-64 flex-1">
              <label className="block mb-1">Monthly Expenses</label>
              <div className="w-full p-2 bg-gray-700 text-white rounded">
                {formatCurrency(monthlyExpenses)}
              </div>
            </div>
            
            <div className="min-w-64 flex-1">
              <label className="block mb-1">Monthly Cash Flow</label>
              <div className="w-full p-2 bg-gray-700 text-white rounded">
                {formatCurrency(monthlyCashFlow)}
              </div>
            </div>
            
            <div className="min-w-64 flex-1">
              <label className="block mb-1">Yearly NOI</label>
              <div className="w-full p-2 bg-gray-700 text-white rounded">
                {formatCurrency(yearlyNOI)}
              </div>
            </div>
            
            <div className="min-w-64 flex-1">
              <label className="block mb-1">Cash on Cash Return</label>
              <div className="w-full p-2 bg-gray-700 text-white rounded">
                {formatPercent(cashOnCashReturn)}
              </div>
            </div>
            
            <div className="min-w-64 flex-1">
              <label className="block mb-1">Yield</label>
              <div className="w-full p-2 bg-gray-700 text-white rounded">
                {formatPercent(yield_)}
              </div>
            </div>
          </div>
        </div>
        
        {/* Deal Grade */}
        <div className="mb-5 p-4 bg-gray-800 rounded">
          <h2 className="mb-3 text-xl font-semibold border-b border-gray-700 pb-2">
            Deal Grade by Strategy
          </h2>
          
          {/* Wholesale Deal Grade */}
          <div className="mt-5 p-4 bg-gray-900 rounded border border-gray-700">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-base font-bold">Wholesale Deal</h3>
              <div className="text-lg font-bold">
                {getWholesaleDealGrade(assignmentFeeValue)}
              </div>
            </div>
            
            <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden mb-2">
              <div 
                className="h-full rounded-full"
                style={{ 
                  width: `${getWholesaleProgressPercentage(assignmentFeeValue)}%`,
                  backgroundColor: assignmentFeeValue >= 15000 ? '#10B981' : 
                                   assignmentFeeValue >= 10000 ? '#34D399' : 
                                   assignmentFeeValue >= 5000 ? '#FBBF24' : '#EF4444'
                }}
              ></div>
            </div>
            
            <div className="mt-3 p-2 rounded text-center bg-gray-800">
              Assignment Fee: {formatCurrency(assignmentFeeValue)} | Actual ARV %: {formatPercent(actualArvPercentage)} | Goal: {formatPercent(arvPercentageGoal)}
            </div>
          </div>
          
          {/* ARV Goal Banner */}
          <div className={`mt-3 p-2 rounded text-center ${meetsArvGoal ? 'bg-green-900 text-green-200' : 'bg-red-900 text-red-200'}`}>
            {arvMessage}
          </div>
          
          {/* Long-Term Rental Grade */}
          <div className="mt-5 p-4 bg-gray-900 rounded border border-gray-700">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-base font-bold">Long-Term Rental</h3>
              <div className="text-lg font-bold">
                {getLTRDealGrade(cashOnCashReturn)}
              </div>
            </div>
            
            <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden mb-2">
              <div 
                className="h-full rounded-full"
                style={{ 
                  width: `${Math.min(100, Math.max(0, cashOnCashReturn / 20 * 100))}%`,
                  backgroundColor: cashOnCashReturn >= 15 ? '#10B981' : 
                                   cashOnCashReturn >= 10 ? '#34D399' : 
                                   cashOnCashReturn >= 8 ? '#FBBF24' : '#EF4444'
                }}
              ></div>
            </div>
          </div>
          
          {/* Short-Term Rental Grade */}
          <div className="mt-5 p-4 bg-gray-900 rounded border border-gray-700">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-base font-bold">Short-Term Rental</h3>
              <div className="text-lg font-bold">
                {getSTRDealGrade(cashOnCashReturn)}
              </div>
            </div>
            
            <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden mb-2">
              <div 
                className="h-full rounded-full"
                style={{ 
                  width: `${Math.min(100, Math.max(0, cashOnCashReturn / 30 * 100))}%`,
                  backgroundColor: cashOnCashReturn >= 25 ? '#10B981' : 
                                   cashOnCashReturn >= 18 ? '#34D399' : 
                                   cashOnCashReturn >= 15 ? '#FBBF24' : '#EF4444'
                }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RealEstateCalculator;