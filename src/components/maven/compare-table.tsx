"use client";

import React, { FC } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";

const renderValue = (value: any): React.ReactNode => {
  if (Array.isArray(value)) {
    return (
      <ul className="list-disc list-inside">
        {value.map((item, index) => (
          <li key={index}>{renderValue(item)}</li>
        ))}
      </ul>
    );
  } else if (typeof value === "object" && value !== null) {
    return (
      <ul className="list-none">
        {Object.entries(value).map(([key, val]) => (
          <li key={key}>
            <span className="font-semibold">{key}:</span> {renderValue(val)}
          </li>
        ))}
      </ul>
    );
  }
  return String(value);
};

interface CompareTableProps {
  content: Record<string, any>[];
}

export const ProductComparison: FC<CompareTableProps> = ({ content }) => {
  const [product1, product2] = content;
  const product1Name = Object.keys(product1)[0];
  const product2Name = Object.keys(product2)[0];
  const product1Specs = product1[product1Name as keyof typeof product1];
  const product2Specs = product2[product2Name as keyof typeof product2];

  const allSections = Array.from(
    new Set([...Object.keys(product1Specs), ...Object.keys(product2Specs)])
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-md font-bold mb-6 text-center">Product Comparison</h1>

      <div className="grid grid-cols-3 gap-4">
        <div></div>
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="text-sm font-bold">{product1Name}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="text-sm font-bold">{product2Name}</CardTitle>
          </CardHeader>
        </Card>

        {allSections.map((section) => (
          <React.Fragment key={section}>
            <div className="col-span-3 text-sm font-semibold mt-4 mb-2">
              {section}
            </div>
            {Object.keys({
              ...product1Specs[section],
              ...product2Specs[section],
            }).map((key) => (
              <React.Fragment key={key}>
                <div className="text-xs font-semibold">{key}</div>
                <div className="text-xs">
                  {renderValue(product1Specs[section]?.[key] ?? "N/A")}
                </div>
                <div className="text-xs">
                  {renderValue(product2Specs[section]?.[key] ?? "N/A")}
                </div>
              </React.Fragment>
            ))}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
