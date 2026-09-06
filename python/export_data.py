"""
Export processed analytical data for React and Power BI consumption.
"""

import pandas as pd
from pathlib import Path

PROCESSED_DIR = Path(__file__).resolve().parent.parent / "data" / "processed"


def export_analytics(analytics_data):
    for name, df in analytics_data.items():
        if isinstance(df, pd.DataFrame) and not df.empty:
            out_path = PROCESSED_DIR / f"{name}.csv"
            df.to_csv(out_path, index=False)
            print(f"  Exported: {out_path.name} ({len(df)} rows)")


def get_summary():
    summary = {}
    for f in PROCESSED_DIR.glob("*.csv"):
        try:
            df = pd.read_csv(f, low_memory=False)
            summary[f.stem] = {
                "rows": len(df),
                "columns": list(df.columns),
            }
        except Exception:
            pass
    return summary


if __name__ == "__main__":
    summary = get_summary()
    print("Processed files:")
    for name, info in summary.items():
        print(f"  {name}: {info['rows']} rows, {len(info['columns'])} columns")
