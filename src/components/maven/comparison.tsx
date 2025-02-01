import { ProductSpecifications } from "@/lib/types/product";
import type React from "react"; // Import React

interface ProductDetailsProps {
  product: ProductSpecifications;
}

export function ProductDetails({ product }: ProductDetailsProps) {
  return (
    <div className="max-w-2xl mx-auto p-4shadow-lg rounded-lg">
      <h1 className="text-2xl font-bold mb-4">
        {product.brand} {product.model}
      </h1>
      <p className="text-sm text-gray-600 mb-4">Category: {product.category}</p>

      {product.specifications && (
        <div className="space-y-6">
          {product.specifications.general && (
            <Section title="General Specifications">
              <SpecItem
                label="Weight"
                value={product.specifications.general.weight}
              />
              <SpecItem
                label="Dimensions"
                value={product.specifications.general.dimensions}
              />
              <SpecItem
                label="Color"
                value={product.specifications.general.color}
              />
              <SpecItem
                label="Material"
                value={product.specifications.general.material}
              />
            </Section>
          )}

          {product.specifications.display && (
            <Section title="Display">
              <SpecItem
                label="Size"
                value={product.specifications.display.size}
              />
              <SpecItem
                label="Resolution"
                value={product.specifications.display.resolution}
              />
              <SpecItem
                label="Type"
                value={product.specifications.display.type}
              />
              <SpecItem
                label="Refresh Rate"
                value={product.specifications.display.refreshRate}
              />
            </Section>
          )}

          {product.specifications.performance && (
            <Section title="Performance">
              <SpecItem
                label="Processor"
                value={product.specifications.performance.processor}
              />
              <SpecItem
                label="RAM"
                value={product.specifications.performance.ram}
              />
              <SpecItem
                label="Storage"
                value={product.specifications.performance.storage}
              />
              <SpecItem
                label="GPU"
                value={product.specifications.performance.gpu}
              />
            </Section>
          )}

          {product.specifications.battery && (
            <Section title="Battery">
              <SpecItem
                label="Capacity"
                value={product.specifications.battery.capacity}
              />
              <SpecItem
                label="Type"
                value={product.specifications.battery.type}
              />
              <SpecItem
                label="Charging"
                value={product.specifications.battery.charging}
              />
            </Section>
          )}

          {product.specifications.connectivity && (
            <Section title="Connectivity">
              <SpecItem
                label="Wi-Fi"
                value={product.specifications.connectivity.wifi}
              />
              <SpecItem
                label="Bluetooth"
                value={product.specifications.connectivity.bluetooth}
              />
              <SpecItem
                label="Cellular"
                value={product.specifications.connectivity.cellular}
              />
              {product.specifications.connectivity.ports && (
                <div className="mt-2">
                  <span className="font-medium text-sm">Ports:</span>
                  <ul className="list-disc list-inside ml-4 text-xs">
                    {product.specifications.connectivity.ports.map(
                      (port, index) => (
                        <li key={index}>{port}</li>
                      )
                    )}
                  </ul>
                </div>
              )}
            </Section>
          )}

          {product.specifications.camera && (
            <Section title="Camera">
              <SpecItem
                label="Rear"
                value={product.specifications.camera.rear}
              />
              <SpecItem
                label="Front"
                value={product.specifications.camera.front}
              />
              <SpecItem
                label="Video"
                value={product.specifications.camera.video}
              />
            </Section>
          )}

          {product.specifications.os && (
            <Section title="Operating System">
              <SpecItem label="OS" value={product.specifications.os} />
            </Section>
          )}

          {product.specifications.additionalFeatures && (
            <Section title="Additional Features">
              <SpecItem
                label="Water Resistance"
                value={
                  product.specifications.additionalFeatures.waterResistance
                }
              />
              {product.specifications.additionalFeatures.biometrics && (
                <div className="mt-2">
                  <span className="font-medium text-sm">Biometrics:</span>
                  <ul className="list-disc list-inside ml-4 text-xs">
                    {product.specifications.additionalFeatures.biometrics.map(
                      (biometric, index) => (
                        <li key={index}>{biometric}</li>
                      )
                    )}
                  </ul>
                </div>
              )}
              <SpecItem
                label="Audio"
                value={product.specifications.additionalFeatures.audio}
              />
            </Section>
          )}
        </div>
      )}
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border-t pt-4">
      <h2 className="text-lg font-semibold mb-2">{title}</h2>
      {children}
    </div>
  );
}

function SpecItem({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  if (!value) return null;
  return (
    <div className="flex justify-between text-sm">
      <span className="font-medium">{label}:</span>
      <span className="text-gray-600">{value}</span>
    </div>
  );
}
