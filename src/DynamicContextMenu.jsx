import React, {Component, Fragment} from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

import ClickOutside from '@langleyfoxall/react-click-outside'
import './style.css';

export default class DynamicContextMenu extends Component {

    constructor(props) {
        super(props);

        this.state = {
            style: null,
            showing: false,
        };

        this.ref = React.createRef();

        this.handleContextMenu = this.handleContextMenu.bind(this);
        this.handleClickOutside = this.handleClickOutside.bind(this);
    }

    handleClick(item, event) {
        event.stopPropagation();

        const {data} = this.props;

        this.setState({showing: false});

        item.onClick(data, event);
    }

    handleClickOutside() {
        this.setState({showing: false})
    }

    handleContextMenu(event) {
        event.preventDefault();
        event.stopPropagation();

        const clickLocation = { x: event.clientX, y: event.clientY };

        // We need to render the menu with all of it's contents in order to calculate the size
        // without displaying it to the user. We can then decide which side of the cursor it should be on
        this.setState(
            { style: { opacity: 0 }, showing: true },
            () => {
                const { onContextMenu } = this.props;
                const { innerWidth: screenW, innerHeight: screenH } = window;
                const style = { opacity: 1 };

                const { width, height } = this.ref.current.getBoundingClientRect();

                if (screenW - clickLocation.x > width) {
                    style.left = `${clickLocation.x + 5}px`;
                } else {
                    style.left = `${clickLocation.x - width - 5}px`;
                }

                if (screenH - clickLocation.y > height) {
                    style.top = `${clickLocation.y + 5}px`;
                } else {
                    style.top = `${clickLocation.y - height - 5}px`;
                }

                this.setState(
                    { style },
                    onContextMenu
                );
            }
        );
    }

    renderDropdown() {
        const {menuItems, ignoreClickEvents} = this.props;

        return (
            <ClickOutside domRef={this.ref} ignoreRefs={ignoreClickEvents}
                          onClickOutside={this.handleClickOutside}>
                <div className="react-context-menu" style={this.state.style}>
                    <ul>
                        {menuItems.map((item, i) => {
                            return <li key={i} onClick={this.handleClick.bind(this, item)}
                                       className={`item-hoverable ${item.className || 0}`}>{item.label}</li>
                        })}
                    </ul>
                </div>
            </ClickOutside>
        );
    }

    render() {
        const {children} = this.props;

        return (
            <Fragment>
                {React.cloneElement(children, {onContextMenu: this.handleContextMenu})}
                {this.state.showing && ReactDOM.createPortal(this.renderDropdown(), document.body)}
            </Fragment>
        )
    }
}

DynamicContextMenu.defaultProps = {
    ignoreClickEvents: null,
    onContextMenu: () => null,
};

DynamicContextMenu.propTypes = {
    menuItems: PropTypes.arrayOf(
        PropTypes.shape({
            label: PropTypes.string.isRequired,
            onClick: PropTypes.func.isRequired,
            className: PropTypes.string,
        })
    ).isRequired,
    ignoreClickEvents: PropTypes.arrayOf(PropTypes.object),
    data: PropTypes.any.isRequired,
    onContextMenu: PropTypes.func,
};