import Image from "next/image";
import Link from "next/link";
import Form from "@/app/warranty-form/warranty-form"; // adjust path as needed

export default function Home() {
  return (
    <div className="bg-black">
      <section className="py-5 bg-black-50">
        <div className="container mx-auto px-4 py-0px my-0px">
          <div className="relative w-full max-w-md mx-auto h-32 flex items-center justify-center">
            <Image
              src="/images/logos/red-warranty-round-stamp-free-png.png"
              alt="JBL Logo"
              fill
              className="object-contain"
              sizes="(max-width: 768px) 80vw, 400px"
            />
          </div>
        </div>
      </section>

      <section className="py-2">
        <div className="container mx-auto px-4 text-left">
          <h2 className="text-3xl font-bold mb-4 text-white">WARRANTY REGISTRATION</h2>
          <p className="text-base mb-8 text-white">
            Please keep your original purchase invoice. You must present your
            original purchase invoice as proof of ownership and entitlement to
            warranty service. Failure to do so could result in disqualification
            for warranty service.{" "}
            <Link
              href="/"
              style={{ color: "var(--jbl-orange)" }}
              className="underline"
            >
              Terms and Conditions apply
            </Link>
            .
          </p>
          <p className="text-base mb-8 text-gray-300">
            "*" indicates required fields
          </p>

          <Form />
        </div>
      </section>
    </div>
  );
}
