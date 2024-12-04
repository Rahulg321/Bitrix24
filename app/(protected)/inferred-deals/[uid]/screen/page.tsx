import ScreenDealComponent from "@/components/ScreenDealComponent";
import {
  fetchQuestionnaires,
  fetchSpecificInferredDeal,
} from "@/lib/firebase/db";
import { Metadata } from "next";
import React from "react";

type Params = Promise<{ uid: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { uid } = await params;

  try {
    const fetchedDeal = await fetchSpecificInferredDeal(uid);
    return {
      title: `Screen ${fetchedDeal?.title}` || "Dark Alpha Capital",
      description:
        `Screen ${fetchedDeal?.main_content}` || "Generated by create next app",
    };
  } catch (error) {
    return {
      title: "Not Found",
      description: "The page you are looking for does not exist",
    };
  }
}

const InferredDealScreenPage = async ({ params }: { params: Params }) => {
  const { uid } = await params;
  const questionnaires = await fetchQuestionnaires();
  const fetchedDeal = await fetchSpecificInferredDeal(uid);

  if (!fetchedDeal) {
    return (
      <section className="mt-10 text-center text-xl">Deal not found</section>
    );
  }

  const {
    id,
    first_name,
    last_name,
    direct_phone,
    work_phone,
    title,
    cashFlow,
    under_contract,
    revenue,
    source,
    ebitda,
    link,
    scraped_by,
    asking_price,
    listing_code,
    state,
    category,
    status,
    main_content,
    explanation,
    grossRevenue,
    inventory,
  } = fetchedDeal;

  console.log("questionnaires", questionnaires);

  return (
    <section className="block-space big-container">
      <h2 className="mb-4">Screen this Deal</h2>
      <ScreenDealComponent
        dealCollection="inferred-deals"
        title={title}
        first_name={first_name}
        last_name={last_name}
        direct_phone={direct_phone}
        work_phone={work_phone}
        under_contract={under_contract}
        revenue={revenue}
        link={link}
        asking_price={asking_price}
        listing_code={listing_code}
        state={state}
        status={status}
        main_content={main_content}
        explanation={explanation}
        id={id}
        ebitda={ebitda}
        category={category}
        grossRevenue={grossRevenue}
        inventory={inventory}
        questionnairesData={JSON.stringify(questionnaires)}
      />
    </section>
  );
};

export default InferredDealScreenPage;
