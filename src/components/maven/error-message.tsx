import { FC } from "react";

interface ErrorProps {
  name: string;
  messsage: string;
  raw?: any;
}

export const ErrorMessage: FC<ErrorProps> = ({ name, messsage, raw }) => {
  return (
    <div className="w-full">
      <div className="border rounded-[2rem]">
        <h3 className="font-semibold">{name}</h3>
        <div className="bg-white p-3 text-black">
          <p className="text-sm">{messsage}</p>
        </div>
        <div className="py-2 bg-muted">
          <pre className="text-xs overflow-x-auto">
            {JSON.stringify(raw, null)}
          </pre>
        </div>
      </div>
    </div>
  );
};
