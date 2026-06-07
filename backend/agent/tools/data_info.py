import pandas as pd
from langchain.tools import StructuredTool

def create_data_info_tool(df: pd.DataFrame) -> StructuredTool:

    def data_info(query: str) -> str:
        """Get information about the dataset including columns, data types, missing values and sample values."""
        info = f"Dataset Shape: {df.shape[0]} rows x {df.shape[1]} columns\n\nColumns:\n"
        for col in df.columns:
            info += f"\n- {col} ({str(df[col].dtype)})"
            info += f"\n  Nulls: {int(df[col].isnull().sum())}"
            info += f"\n  Unique Values: {int(df[col].nunique())}"
            info += f"\n  Samples: {df[col].dropna().head(3).tolist()}"
        return info

    return StructuredTool.from_function(
        func=data_info,
        name="data_info_tool",
        description="Use this tool to get information about the dataset. Use it when the user asks about columns, data types, shape, missing values, or wants a dataset overview."
    )