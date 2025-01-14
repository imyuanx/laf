import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { t } from "i18next";

import { StandardIcon } from "@/components/CommonIcon";

import PricingCard from "./PricingCard";

import { ResourceControllerCalculatePrice } from "@/apis/v1/resources";
import useGlobalStore from "@/pages/globalStore";

type price = {
  cpu: number;
  memory: number;
  databaseCapacity: number;
  storageCapacity: number;
  total: number;
};

export default function PricingStandards() {
  const { regions } = useGlobalStore((state) => state);

  const [price, setPrice] = useState<price>({
    cpu: 0,
    memory: 0,
    databaseCapacity: 0,
    storageCapacity: 0,
    total: 0,
  });

  useQuery(
    ["useBillingPriceQuery"],
    async () => {
      return ResourceControllerCalculatePrice({
        cpu: 1000,
        memory: 1024,
        databaseCapacity: 1024,
        storageCapacity: 1024,
        regionId: regions && regions[0].bundles[0].regionId,
      });
    },
    {
      onSuccess(res) {
        setPrice((res?.data as price) || {});
      },
    },
  );

  const { cpu, memory, databaseCapacity, storageCapacity } = price;

  const pricingData = [
    { color: "bg-primary-500", title: "CPU", value: cpu },
    { color: "bg-blue-600", title: "内存", value: memory },
    { color: "bg-adora-600", title: "数据库", value: databaseCapacity },
    { color: "bg-error-400", title: "云存储", value: storageCapacity },
  ];

  return (
    <div>
      <div className="flex items-center pt-2 text-2xl">
        <StandardIcon boxSize={5} mr={3} />
        {t("SettingPanel.PricingStandards")}
      </div>
      <div className="flex justify-center pt-10">
        {pricingData.map((data) => (
          <PricingCard color={data.color} title={data.title} value={data.value} key={data.title} />
        ))}
      </div>
    </div>
  );
}
