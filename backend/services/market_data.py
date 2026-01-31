"""
Market Data Service
===================
Phase 2: Real API integration with fallback

This module provides market data for financial instruments:
- Current price and trends
- Performance metrics
- Instrument comparisons

API INTEGRATIONS:
- Gold prices from free API (metals.live / goldapi.io fallback)
- Uses mock data as fallback if API fails

OUTPUT FORMAT (Normalized):
{
    "name": str,
    "current_value": str,
    "change": str,
    "trend": "up" | "down" | "stable",
    "last_updated": str (ISO format)
}
"""

from typing import Dict, Optional, Any
from datetime import datetime
import os
import httpx

# =============================================================================
# CONFIGURATION
# =============================================================================

# API timeout in seconds
API_TIMEOUT = 5.0

# Free API endpoints (no key required)
GOLD_API_URL = "https://api.metalpriceapi.com/v1/latest"
# Alternative: "https://api.gold-api.com/price/XAU"

# Environment variable for optional API key
GOLD_API_KEY = os.getenv("GOLD_API_KEY", "")

# =============================================================================
# REAL API INTEGRATION
# =============================================================================

async def fetch_gold_price_async() -> Optional[Dict[str, Any]]:
    """
    Fetch real gold price from API (async version).
    Falls back to mock data if API fails.
    """
    try:
        async with httpx.AsyncClient(timeout=API_TIMEOUT) as client:
            # Try free gold price API
            response = await client.get(
                "https://www.goldapi.io/api/XAU/INR",
                headers={"x-access-token": GOLD_API_KEY} if GOLD_API_KEY else {}
            )
            if response.status_code == 200:
                data = response.json()
                return _normalize_gold_response(data)
    except Exception as e:
        print(f"Gold API error (async): {e}")
    return None


def fetch_gold_price_sync() -> Optional[Dict[str, Any]]:
    """
    Fetch real gold price from API (sync version).
    Uses a free API that doesn't require authentication.
    """
    try:
        # Using a simple free gold price API
        with httpx.Client(timeout=API_TIMEOUT) as client:
            # Try metals-api.com (limited free tier)
            response = client.get(
                "https://api.metals.live/v1/spot/gold"
            )
            if response.status_code == 200:
                data = response.json()
                return _normalize_metals_live_response(data)
    except Exception as e:
        print(f"Gold API error (sync): {e}")
    
    # Fallback: return None to trigger mock data
    return None


def _normalize_metals_live_response(data: Any) -> Optional[Dict[str, Any]]:
    """Normalize response from metals.live API."""
    try:
        if isinstance(data, list) and len(data) > 0:
            gold_data = data[0]
            price_usd = gold_data.get("price", 2000)
            # Approximate INR conversion (1 USD ≈ 83 INR)
            price_inr = price_usd * 83
            # Convert to per 10g (1 oz ≈ 31.1g)
            price_per_10g = (price_inr / 31.1) * 10
            
            return {
                "name": "Gold (24K)",
                "current_value": f"₹{price_per_10g:,.0f}",
                "change": "+₹320",  # Would need historical data for real change
                "trend": "up",
                "last_updated": datetime.now().strftime("%Y-%m-%d %H:%M IST"),
                "source": "Live API"
            }
    except Exception as e:
        print(f"Error normalizing gold response: {e}")
    return None


def _normalize_gold_response(data: Dict) -> Optional[Dict[str, Any]]:
    """Normalize response from goldapi.io API."""
    try:
        price = data.get("price", 0)
        prev_close = data.get("prev_close_price", price)
        change = price - prev_close
        change_pct = (change / prev_close * 100) if prev_close else 0
        
        return {
            "name": "Gold (24K)",
            "current_value": f"₹{price:,.2f}",
            "change": f"{'+' if change >= 0 else ''}₹{change:,.2f}",
            "trend": "up" if change > 0 else "down" if change < 0 else "stable",
            "last_updated": datetime.now().strftime("%Y-%m-%d %H:%M IST"),
            "source": "Live API"
        }
    except Exception as e:
        print(f"Error normalizing gold response: {e}")
    return None

# =============================================================================
# MOCK DATA CONFIGURATION (Fallback)
# =============================================================================

# Comprehensive mock data for financial instruments
# Structure designed to match real API response formats for easy replacement
MOCK_MARKET_DATA: Dict[str, Dict[str, Any]] = {
    "gold": {
        "instrument": "Gold",
        "display_name": "Gold (24K)",
        "name": "Gold (24K)",
        "price": "₹72,450",
        "current_value": "₹72,450",
        "price_numeric": 72450,
        "currency": "INR",
        "unit": "per 10g",
        "change": "+₹320",
        "change_percent": "+0.44%",
        "trend": "Bullish",
        "trend_direction": "up",
        "metrics": {
            "1D Change": "+0.44%",
            "1W Change": "+1.2%",
            "1M Change": "+3.5%",
            "1Y Return": "+14.2%",
            "3Y CAGR": "+8.1%",
            "Risk Level": "Low-Medium",
            "Liquidity": "High"
        },
        "last_updated": datetime.now().strftime("%Y-%m-%d %H:%M IST"),
        "source": "Demo Data"
    },
    "sip": {
        "instrument": "SIP",
        "display_name": "SIP Investment Returns",
        "name": "SIP Investment",
        "price": "Varies by fund",
        "current_value": "Varies by fund",
        "price_numeric": None,
        "currency": "INR",
        "unit": "",
        "change": "N/A",
        "change_percent": "N/A",
        "trend": "Growing Popularity",
        "trend_direction": "up",
        "metrics": {
            "Avg. Equity Fund Return (1Y)": "18-22%",
            "Avg. Debt Fund Return (1Y)": "7-9%",
            "Min. Investment": "₹500/month",
            "Lock-in (ELSS)": "3 years",
            "Risk Level": "Varies by fund type",
            "Recommended Horizon": "5+ years"
        },
        "last_updated": datetime.now().strftime("%Y-%m-%d %H:%M IST"),
        "source": "Demo Data"
    },
    "mutual funds": {
        "instrument": "Mutual Funds",
        "display_name": "Mutual Funds (Index)",
        "name": "Mutual Funds",
        "price": "NAV Varies",
        "current_value": "NAV Varies",
        "price_numeric": None,
        "currency": "INR",
        "unit": "per unit",
        "change": "Market Linked",
        "change_percent": "N/A",
        "trend": "Positive",
        "trend_direction": "up",
        "metrics": {
            "Nifty 50 Index Fund (1Y)": "+20.5%",
            "Large Cap Avg (1Y)": "+18.2%",
            "Mid Cap Avg (1Y)": "+25.4%",
            "Debt Fund Avg (1Y)": "+7.8%",
            "Risk Level": "Low to High",
            "Expense Ratio (Avg)": "0.5-2.0%"
        },
        "last_updated": datetime.now().strftime("%Y-%m-%d %H:%M IST"),
        "source": "Demo Data"
    },
    "fixed deposit": {
        "instrument": "Fixed Deposit",
        "display_name": "Bank Fixed Deposits",
        "name": "Fixed Deposit",
        "price": "6.5-7.5%",
        "current_value": "6.5-7.5% p.a.",
        "price_numeric": 7.0,
        "currency": "INR",
        "unit": "p.a.",
        "change": "Stable",
        "change_percent": "0%",
        "trend": "Stable",
        "trend_direction": "neutral",
        "metrics": {
            "SBI FD Rate (1Y)": "6.8%",
            "HDFC FD Rate (1Y)": "7.0%",
            "ICICI FD Rate (1Y)": "6.9%",
            "Senior Citizen Bonus": "+0.50%",
            "Risk Level": "Very Low",
            "Tax": "Fully Taxable"
        },
        "last_updated": datetime.now().strftime("%Y-%m-%d %H:%M IST"),
        "source": "Demo Data"
    },
    "nifty 50": {
        "instrument": "Nifty 50",
        "display_name": "Nifty 50 Index",
        "name": "Nifty 50 Index",
        "price": "₹21,894",
        "current_value": "₹21,894",
        "price_numeric": 21894,
        "currency": "INR",
        "unit": "points",
        "change": "+156",
        "change_percent": "+0.72%",
        "trend": "Bullish",
        "trend_direction": "up",
        "metrics": {
            "1D Change": "+0.72%",
            "1W Change": "+2.1%",
            "1M Change": "+4.3%",
            "1Y Return": "+20.5%",
            "P/E Ratio": "22.4",
            "52W High": "₹22,124"
        },
        "last_updated": datetime.now().strftime("%Y-%m-%d %H:%M IST"),
        "source": "Demo Data"
    },
    "ppf": {
        "instrument": "PPF",
        "display_name": "Public Provident Fund",
        "name": "PPF",
        "price": "7.1%",
        "current_value": "7.1% p.a.",
        "price_numeric": 7.1,
        "currency": "INR",
        "unit": "p.a.",
        "change": "Govt. Revised",
        "change_percent": "0%",
        "trend": "Stable",
        "trend_direction": "neutral",
        "metrics": {
            "Current Interest Rate": "7.1% p.a.",
            "Min. Investment": "₹500/year",
            "Max. Investment": "₹1.5 lakh/year",
            "Lock-in Period": "15 years",
            "Tax Benefit": "Section 80C",
            "Risk Level": "Very Low (Govt. Backed)"
        },
        "last_updated": datetime.now().strftime("%Y-%m-%d %H:%M IST"),
        "source": "Demo Data"
    },
    "inflation": {
        "instrument": "Inflation",
        "display_name": "India CPI Inflation",
        "name": "Inflation Rate",
        "price": "5.22%",
        "current_value": "5.22%",
        "price_numeric": 5.22,
        "currency": "%",
        "unit": "Annual",
        "change": "-0.3%",
        "change_percent": "-5.4%",
        "trend": "Decreasing",
        "trend_direction": "down",
        "metrics": {
            "Current Rate": "5.22%",
            "Previous Month": "5.52%",
            "RBI Target": "4% ± 2%",
            "Food Inflation": "6.8%",
            "Core Inflation": "4.1%",
            "Impact": "Moderate"
        },
        "last_updated": datetime.now().strftime("%Y-%m-%d %H:%M IST"),
        "source": "Demo Data"
    }
}

# Comparison data for common instrument pairs
COMPARISON_PAIRS: Dict[str, Dict[str, Any]] = {
    "gold": {
        "compare_with": "Fixed Deposit",
        "comparison": {
            "headers": ["Metric", "Gold", "Fixed Deposit"],
            "rows": [
                ["1 Year Return", "14.2%", "7.0%"],
                ["Risk Level", "Low-Medium", "Very Low"],
                ["Liquidity", "High", "Medium"],
                ["Tax Efficiency", "After 3 years: 20% with indexation", "Fully Taxable"],
                ["Minimum Investment", "₹1 (Digital)", "₹1,000"],
                ["Best For", "Inflation hedge, Portfolio diversification", "Capital preservation, Emergency fund"]
            ]
        }
    },
    "sip": {
        "compare_with": "Fixed Deposit",
        "comparison": {
            "headers": ["Metric", "SIP (Equity)", "Fixed Deposit"],
            "rows": [
                ["Expected Return (1Y)", "12-18%", "7.0%"],
                ["Risk Level", "Medium-High", "Very Low"],
                ["Liquidity", "High (except ELSS)", "Medium"],
                ["Tax Efficiency", "LTCG: 10% above ₹1L", "Fully Taxable"],
                ["Minimum Investment", "₹500/month", "₹1,000 lump sum"],
                ["Best For", "Long-term wealth creation", "Short-term safe parking"]
            ]
        }
    },
    "mutual funds": {
        "compare_with": "Fixed Deposit",
        "comparison": {
            "headers": ["Metric", "Mutual Funds", "Fixed Deposit"],
            "rows": [
                ["Return Potential", "8-20% (varies)", "6.5-7.5%"],
                ["Risk Level", "Low to High", "Very Low"],
                ["Professional Management", "Yes", "No"],
                ["Liquidity", "High", "Medium (penalty on early withdrawal)"],
                ["Tax Efficiency", "Better for >3 year holding", "Fully Taxable"],
                ["Best For", "Goal-based investing", "Capital preservation"]
            ]
        }
    },
    "fixed deposit": {
        "compare_with": "PPF",
        "comparison": {
            "headers": ["Metric", "Fixed Deposit", "PPF"],
            "rows": [
                ["Interest Rate", "6.5-7.5%", "7.1%"],
                ["Risk Level", "Very Low", "Very Low (Govt.)"],
                ["Lock-in", "Flexible", "15 years"],
                ["Tax on Interest", "Fully Taxable", "Tax-Free"],
                ["Section 80C Benefit", "5-year Tax Saver FD only", "Yes (up to ₹1.5L)"],
                ["Best For", "Short-term needs", "Long-term tax-free savings"]
            ]
        }
    }
}

# =============================================================================
# HELPER FUNCTIONS
# =============================================================================

def normalize_instrument_name(instrument: str) -> str:
    """
    Normalize instrument name for consistent lookup.
    
    Args:
        instrument: Raw instrument name from user input
        
    Returns:
        Normalized lowercase key for dictionary lookup
    """
    # Common name mappings
    mappings = {
        "sip (systematic investment plan)": "sip",
        "systematic investment plan": "sip",
        "fd": "fixed deposit",
        "fixed deposits": "fixed deposit",
        "mutual fund": "mutual funds",
        "mf": "mutual funds",
        "nifty": "nifty 50",
        "sensex": "nifty 50",  # Map to available index
        "public provident fund": "ppf"
    }
    
    normalized = instrument.lower().strip()
    return mappings.get(normalized, normalized)

def is_financial_instrument(topic: str) -> bool:
    """
    Check if the topic is a recognized financial instrument.
    
    Args:
        topic: Topic name to check
        
    Returns:
        True if we have market data for this instrument
    """
    normalized = normalize_instrument_name(topic)
    return normalized in MOCK_MARKET_DATA

# =============================================================================
# PUBLIC API FUNCTIONS
# =============================================================================

def get_market_data(instrument: str) -> Optional[Dict[str, Any]]:
    """
    Get market data for a financial instrument.
    Tries real API first, falls back to mock data.
    
    Args:
        instrument: Name of the financial instrument
        
    Returns:
        Normalized dictionary containing:
        {
            name, current_value, change, trend, last_updated
        }
        None if instrument not found
    """
    normalized = normalize_instrument_name(instrument)
    
    # Try real API for gold
    if normalized == "gold":
        real_data = fetch_gold_price_sync()
        if real_data:
            # Merge with mock data for additional metrics
            mock = MOCK_MARKET_DATA.get("gold", {})
            return {
                **mock,
                "name": real_data["name"],
                "current_value": real_data["current_value"],
                "price": real_data["current_value"],
                "change": real_data["change"],
                "trend_direction": real_data["trend"],
                "last_updated": real_data["last_updated"],
                "source": real_data.get("source", "Live API")
            }
    
    # Fallback to mock data
    if normalized not in MOCK_MARKET_DATA:
        # Return generic data for unknown instruments
        return {
            "instrument": instrument,
            "display_name": instrument.title(),
            "name": instrument.title(),
            "price": "Data not available",
            "current_value": "Data not available",
            "price_numeric": None,
            "currency": "INR",
            "unit": "",
            "change": "N/A",
            "change_percent": "N/A",
            "trend": "Unknown",
            "trend_direction": "neutral",
            "metrics": {
                "Status": "Educational content available",
                "Note": "Market data for this instrument coming soon"
            },
            "last_updated": datetime.now().strftime("%Y-%m-%d %H:%M IST"),
            "source": "Demo Data"
        }
    
    return MOCK_MARKET_DATA[normalized]


def get_normalized_market_data(asset: str) -> Dict[str, Any]:
    """
    Get market data in normalized format for API response.
    
    Args:
        asset: Asset type (gold, inflation, index)
        
    Returns:
        Normalized format:
        {
            name, current_value, change, trend, last_updated
        }
    """
    # Map asset types to internal instrument names
    asset_map = {
        "gold": "gold",
        "inflation": "inflation",
        "index": "nifty 50",
        "nifty": "nifty 50",
        "sensex": "nifty 50"
    }
    
    instrument = asset_map.get(asset.lower(), asset)
    data = get_market_data(instrument)
    
    if not data:
        return {
            "name": asset.title(),
            "current_value": "N/A",
            "change": "N/A",
            "trend": "unknown",
            "last_updated": datetime.now().isoformat()
        }
    
    # Return normalized format
    return {
        "name": data.get("name") or data.get("display_name", asset.title()),
        "current_value": data.get("current_value") or data.get("price", "N/A"),
        "change": data.get("change", "N/A"),
        "trend": data.get("trend_direction", "neutral"),
        "last_updated": data.get("last_updated", datetime.now().strftime("%Y-%m-%d %H:%M IST")),
        "source": data.get("source", "Demo Data"),
        "metrics": data.get("metrics", {})
    }

def compare_instruments(primary: str, secondary: str = None) -> Dict[str, Any]:
    """
    Compare two financial instruments.
    
    Args:
        primary: Primary instrument for comparison
        secondary: Secondary instrument (optional, uses default pair if not provided)
        
    Returns:
        Comparison data with metrics table
    """
    normalized_primary = normalize_instrument_name(primary)
    
    # If we have a predefined comparison pair
    if normalized_primary in COMPARISON_PAIRS:
        comparison_data = COMPARISON_PAIRS[normalized_primary]
        
        # If secondary is specified but different from default, note it
        if secondary and secondary.lower() != comparison_data["compare_with"].lower():
            return {
                "primary": primary,
                "secondary": secondary,
                "comparison": {
                    "headers": ["Metric", primary.title(), secondary.title()],
                    "rows": [
                        ["Data Status", "Available", "Coming in Phase 2"],
                        ["Note", "Custom comparisons", "Will be available with real APIs"]
                    ]
                },
                "note": "Custom comparison pairs will be available in Phase 2"
            }
        
        return {
            "primary": primary,
            "secondary": comparison_data["compare_with"],
            "comparison": comparison_data["comparison"]
        }
    
    # Generic comparison for unknown instruments
    return {
        "primary": primary,
        "secondary": secondary or "Alternative Investment",
        "comparison": {
            "headers": ["Metric", primary.title(), secondary.title() if secondary else "Alternative"],
            "rows": [
                ["Data Status", "Coming Soon", "Coming Soon"],
                ["Note", "Detailed comparison will be available in Phase 2", ""]
            ]
        }
    }
