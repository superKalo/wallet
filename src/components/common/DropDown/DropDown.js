import './DropDown.css'

import { useEffect, useRef, useState } from 'react';
import { BsChevronUp, BsChevronDown } from 'react-icons/bs'
import { CSSTransition } from 'react-transition-group';

export default function DropDown(props) {
    const ref = useRef();
    const transitionRef = useRef();
    const [isDropDownOpen, setDropDownOpen] = useState(false);

    function useOnClickOutside(ref, handler) {
        useEffect(
            () => {
                const listener = (event) => {
                    if (!ref.current || ref.current.contains(event.target)) {
                        return;
                    }
                    handler(event);
                };
                document.addEventListener("mousedown", listener);
                document.addEventListener("touchstart", listener);
                    return () => {
                        document.removeEventListener("mousedown", listener);
                        document.removeEventListener("touchstart", listener);
                    };
            },
            [ref, handler]
        );
    }

    useOnClickOutside(ref, () => setDropDownOpen(false));

    return (
        <div className="dropdown" ref={ref}>
            <div className="content" onClick={() => setDropDownOpen(!isDropDownOpen)}>
                <div className="title">{props.title}</div>
                {
                    props.badge ? 
                        <div className="badge">
                            { props.badge > 9 ? '9+' : props.badge }
                        </div>
                        :
                        null
                }
                <div className="handle">
                    {
                        isDropDownOpen ? 
                            <BsChevronUp size={20}></BsChevronUp>
                            :
                            <BsChevronDown size={20}></BsChevronDown>
                    }
                </div>
            </div>
            <CSSTransition unmountOnExit in={isDropDownOpen} timeout={200} classNames="fade" nodeRef={transitionRef}>
                <div className="list" ref={transitionRef}>
                    {props.children}
                </div>
            </CSSTransition>
        </div>
    )
}