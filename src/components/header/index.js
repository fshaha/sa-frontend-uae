import React, { Component } from 'react';
import { NavLink } from 'react-router-dom';
import { connect } from 'react-redux';
// import { bindActionCreators } from 'redux'
import {
	DropdownItem,
	DropdownMenu,
	DropdownToggle,
	Nav,
	NavItem,
	UncontrolledDropdown,
	// Badge
} from 'reactstrap';
import PropTypes from 'prop-types';

import {
	AppAsideToggler,
	AppNavbarBrand,
	AppSidebarToggler,
} from '@coreui/react';

import './style.scss';

import logo from 'assets/images/brand/logo.png';
import sygnet from 'assets/images/brand/sygnet.png';
import avatar from 'assets/images/avatars/default-avatar.jpg';
import {data}  from '../../screens/Language/index'
import LocalizedStrings from 'react-localization';
// import avatar from 'assets/images/avatars/6.jpg'

const propTypes = {
	children: PropTypes.node,
};

const defaultProps = {};

const mapStateToProps = (state) => {
	return {
		profile: state.auth.profile,
	};
};

// mapDispatchToProps = (dispatch) => {(
//   authAction: BindActionCreators(AuthAction,dispatch)
// )}

let strings = new LocalizedStrings(data);
class Header extends Component {
	constructor(props) {
		super(props);
		this.state = {
			language: window['localStorage'].getItem('language'),
			profilePic: [],
		};

		this.signOut = this.signOut.bind(this);
	}

	componentDidMount() {}

	signOut() {
		this.props.authActions.logOut();
		this.props.history.push('/login');
	}

	render() {
		strings.setLanguage('en');
		const { profile } = this.props;
		return (
			<React.Fragment>
				<AppSidebarToggler className="d-lg-none" display="md" mobile />
				<AppNavbarBrand
					className="p-2 ml-3 "
					tag={NavLink}
					to={'/admin/dashboard'}
					full={{
						src: logo,
						width: '115%',
						height: 'auto',
						alt: 'CoreUI Logo',
					}}
					minimized={{
						src: sygnet,
						width: '100%',
						height: 'auto',
						alt: 'CoreUI Logo',
					}}
				/>
				<AppSidebarToggler className="d-md-down-none" display="lg">
					<i className="fa fa-bars header-sidebar-icon"></i>
				</AppSidebarToggler>
				<Nav className="ml-auto" navbar>
					{/* <NavItem>
						<AppAsideToggler className="d-md-down-none">
							<i className="fa fa-bell header-icon"></i>
						</AppAsideToggler>
					</NavItem> */}
						<img
								src={
									profile && profile.profileImageBinary !== null
										? 'data:image/jpg;base64,' + profile.profileImageBinary
										: avatar
								}
								className="img-avatar mr-2"
								alt=""
							/>
					<UncontrolledDropdown nav direction="down">
						<DropdownToggle nav>
						Hey	<i>{profile && profile.firstName +" "+ profile.lastName}</i>
							<i class="fas fa-angle-down ml-2 mr-3"></i>
						</DropdownToggle>
						<DropdownMenu right>
							<DropdownItem
								onClick={() => this.props.history.push('/admin/profile')}
							>
								<i className="fas fa-user"></i>  {strings.Profile }
							</DropdownItem>
							<DropdownItem
								onClick={() =>
									this.props.history.push('/admin/settings/general')
								}
							>
								<i className="icon-wrench"></i>  {strings.GeneralSettings}
							</DropdownItem>
							{/* <DropdownItem onClick={() => this.props.history.push('/admin/settings/transaction-category')}>
                <i className="icon-graph"></i> Transaction Category
              </DropdownItem> */}
							<DropdownItem
								onClick={() => this.props.history.push('/admin/settings/user')}
							>
								<i className="fas fa-user-tag"></i>  {strings.User}
							</DropdownItem>
							<DropdownItem
								onClick={() =>
									this.props.history.push('/admin/settings/user-role')
								}
							>
								<i className="fas fa-users"></i> {strings.Role}
							</DropdownItem>
							<DropdownItem
                                onClick={() =>
                                    this.props.history.push('/admin/settings/template')
                                }
                            >
                             <i class="fas fa-palette"></i> Mail Themes
                            </DropdownItem>
							<DropdownItem
                                onClick={() =>
                                    this.props.history.push('/admin/settings/import')
                                }
                            >
                             <i class="fas fa-palette"></i>Import
                            </DropdownItem>
							{/* <DropdownItem
								onClick={() =>
									this.props.history.push('/admin/settings/notification')
								}
							>
								<i className="fas fa-bell"></i> Notifications
							</DropdownItem> */}
							{/* <DropdownItem
								onClick={() =>
									this.props.history.push('/admin/settings/data-backup')
								}
							>
								<i className="fas fa-hdd-o"></i> Data Backup
							</DropdownItem> */}
							<DropdownItem
								onClick={() => this.props.history.push('/admin/settings/help')}
							>
								<i className="fas fa-info-circle"></i> {strings.Help}
							</DropdownItem>
							<DropdownItem
									onClick={this.signOut}
							>
								<i className="fa fa-sign-out header-icon mr-1"></i> {strings.LogOut}
							</DropdownItem>
						</DropdownMenu>
					</UncontrolledDropdown>
					{/* <NavItem className="px-3">
						<button
							className="nav-link d-flex align-items-center my-link"
							onClick={this.signOut}
						>
							<i className="fa fa-sign-out header-icon mr-1"></i> Log Out
						</button>
					</NavItem> */}
				</Nav>
			</React.Fragment>
		);
	}
}

Header.propTypes = propTypes;
Header.defaultProps = defaultProps;

export default connect(mapStateToProps, null)(Header);
