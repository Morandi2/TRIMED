export default function GridShape() {
  return (
    <>
      <div className="absolute right-0 top-0 -z-1 w-[250px] h-[250px] xl:w-[380px] xl:h-[380px] overflow-hidden pointer-events-none" aria-hidden="true">
        <svg className="w-full h-full block" viewBox="0 0 200 200" preserveAspectRatio="xMinYMin meet" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="medicalPattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M17 15h2v4h4v2h-4v4h-2v-4h-4v-2h4v-4z" 
                    fill="currentColor" 
                    fillOpacity="0.08"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#medicalPattern)" />
        </svg>
      </div>
      <div className="absolute bottom-0 left-0 -z-1 w-[250px] h-[250px] xl:w-[380px] xl:h-[380px] overflow-hidden rotate-180 pointer-events-none" aria-hidden="true">
        <svg className="w-full h-full block" viewBox="0 0 200 200" preserveAspectRatio="xMinYMin meet" xmlns="http://www.w3.org/2000/svg">
          <rect width="100%" height="100%" fill="url(#medicalPattern)" />
        </svg>
      </div>
    </>
  );
}
