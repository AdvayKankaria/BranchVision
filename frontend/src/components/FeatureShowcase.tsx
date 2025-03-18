import React from "react";
import { FileCheck, CreditCard, ShieldCheck, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

const FeatureShowcase = () => {
  const features = [
    {
      title: "Paperless Process",
      description:
        "Upload your documents digitally without any physical paperwork",
      icon: FileCheck,
      color: "bg-blue-50 text-blue-500",
    },
    {
      title: "Quick Approval",
      description:
        "Get your loan approved in minutes with our streamlined process",
      icon: Clock,
      color: "bg-green-50 text-green-500",
    },
    {
      title: "Secure & Private",
      description:
        "Your data is encrypted and protected with bank-grade security",
      icon: ShieldCheck,
      color: "bg-purple-50 text-purple-500",
    },
    {
      title: "Flexible Options",
      description:
        "Choose from a variety of loan products tailored to your needs",
      icon: CreditCard,
      color: "bg-amber-50 text-amber-500",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Welcome to BranchVision
        </h2>
        <p className="text-base text-gray-600">
          Simplifying your loan application process with a modern, secure, and
          efficient platform.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {features.map((feature, index) => (
          <div
            key={index}
            className="flex flex-col items-center text-center space-y-2"
          >
            <div className={cn("p-3 rounded-full", feature.color)}>
              <feature.icon className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-medium text-gray-800">
              {feature.title}
            </h3>
            <p className="text-xs text-gray-600">{feature.description}</p>
          </div>
        ))}
      </div>

      <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
        <h3 className="font-medium text-gray-800 mb-2">How it works</h3>
        <ol className="space-y-2 text-sm">
          <li className="flex gap-2">
            <span className="bg-primary text-white w-5 h-5 rounded-full flex items-center justify-center text-xs font-medium shrink-0">
              1
            </span>
            <span className="text-gray-600">
              Watch the introduction video from our loan manager.
            </span>
          </li>
          <li className="flex gap-2">
            <span className="bg-primary text-white w-5 h-5 rounded-full flex items-center justify-center text-xs font-medium shrink-0">
              2
            </span>
            <span className="text-gray-600">
              Upload your identification documents (Aadhaar, PAN).
            </span>
          </li>
          <li className="flex gap-2">
            <span className="bg-primary text-white w-5 h-5 rounded-full flex items-center justify-center text-xs font-medium shrink-0">
              3
            </span>
            <span className="text-gray-600">
              Fill in your personal and income details.
            </span>
          </li>
          <li className="flex gap-2">
            <span className="bg-primary text-white w-5 h-5 rounded-full flex items-center justify-center text-xs font-medium shrink-0">
              4
            </span>
            <span className="text-gray-600">
              Review and submit your application.
            </span>
          </li>
        </ol>
      </div>
    </div>
  );
};

export default FeatureShowcase;
