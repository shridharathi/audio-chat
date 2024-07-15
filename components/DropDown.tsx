import React, { useEffect, useState } from 'react';



type DropDownProps = {
  elems: string[];
  showDropDown: boolean;
  toggleDropDown: Function;
  elemSelection: Function;
  style?: React.CSSProperties;
};


const DropDown: React.FC<DropDownProps> = ({
  elems,
  elemSelection,
  style, 
}: DropDownProps): JSX.Element => {
  const [showDropDown, setShowDropDown] = useState<boolean>(false);

  /**
   * Handle passing the city name
   * back to the parent component
   *
   * @param elem  The selected city
   */
  const onClickHandler = (elem: string): void => {
    elemSelection(elem);
  };

  useEffect(() => {
    setShowDropDown(showDropDown);
  }, [showDropDown]);

  return (
    <>
      <div style={style} className={showDropDown ? 'dropdown' : 'dropdown active'}>
        {elems.map(
          (elem: string, index: number): JSX.Element => {
            return (
              <p
                key={index}
                onClick={(): void => {
                  onClickHandler(elem);
                }}
              >
                {elem}
              </p>
            );
          }
        )}
      </div>
    </>
  );
};

export default DropDown;