/**
 * Copyright (c) Cisco Systems, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { DateTime } from "luxon";
import {
  html,
  LitElement,
  customElement,
  property,
  PropertyValues,
  query,
  internalProperty
} from "lit-element";
import styles from "./VisitBadge.scss";
import { nothing } from "lit-html";
import { MenuOverlay } from "@momentum-ui/web-components";

interface VisitTypes {
  [key: string]: {
    icon: string;
    color: string;
  };
}
@customElement("visit-badge")
export default class VisitBadge extends LitElement {
  @property({ type: Number, attribute: "o2-limit" }) o2Limit = 80;
  @property({ type: String, attribute: "visit-type" }) visitType =
    "General Visit";
  @property({ type: Object, attribute: false }) visit:
    | CustomerVisit
    | undefined;

  @query(".wrapper") wrapper!: HTMLElement | undefined;
  @query("md-menu-overlay") menu!: MenuOverlay | undefined;
  @internalProperty() coords = { x: 0, y: 0 };
  @internalProperty() menuOpen = false;

  VISITTYPES: VisitTypes = {
    "General Visit": { icon: "icon-document_12", color: "blue" },
    "Follow-up Visit": { icon: "icon-document_12", color: "violet" },
    "Full Body Checkup": { icon: "icon-file-locked_12", color: "orange" },
    "Medical Tests": { icon: "icon-document_12", color: "green" }
  };

  connectedCallback() {
    super.connectedCallback();
  }

  firstUpdated(changedProperties: PropertyValues) {
    super.firstUpdated(changedProperties);
    // this.setCoordinates()
  }

  disconnectedCallback() {
    super.disconnectedCallback();
  }

  setCoordinates = () => {
    const { x, y } = this.wrapper?.getBoundingClientRect() || { x: 0, y: 0 };
    this.coords = { x, y };
    console.log(this.coords);
    this.menu!.style.position = "fixed";
    // this.menu!.style.left = x.toString()
    this.wrapper!.style.top = (y - 25).toString();
  };

  toggleMenuOpen = () => {
    this.menuOpen = !this.menuOpen;
    this.menuOpen === true
      ? (this.menu!.style.position = "fixed")
      : (this.menu!.style.position = "absolute");
  };

  matrixPosition = (date: string) => {
    const time = DateTime.fromISO(date).toLocal();
    const hour = time.hour;
    const day = time.ordinal;
    const formattedDate = time.toSQLDate();
    // this breaks hard-coded height of 400px into hour-sized chunks, & compensates for out-of-range hours and 33px baseline shift.
    const xPosition = (400 / 9) * (hour - 7) - 33;
    const yPosition = (100 / 365) * day;

    return [xPosition, yPosition, formattedDate];
  };

  getVisitIcon = () => {
    return html`
      <md-icon
        name=${this.VISITTYPES[this.visitType].icon}
        color="default"
      ></md-icon>
    `;
  };

  formatO2Stat = (stat: number) => {
    if (stat < this.o2Limit) {
      return html`
        <span style="color: red; line-height: normal"
          >%${stat.toString()}<md-icon
            name="icon-warning_16"
            color="red"
            style="position:relative; bottom: -3px"
          ></md-icon
        ></span>
      `;
    } else {
      return html`
        <span>%${stat.toString()}</span>
      `;
    }
  };

  visitDetailsOverlay = (visit: CustomerVisit, formattedDate: string) => {
    return html`
      <div class="visit-details-header">
        <md-badge small circle color=${this.VISITTYPES[this.visitType].color}>
          ${this.getVisitIcon()}
        </md-badge>
        <div>
          <h2>${visit.title}</h2>
          <h3>${formattedDate}</h3>
        </div>
        <div>
          <md-button
            hasremovestyle
            class="md-close md-modal__close"
            aria-label="Close Modal"
          >
            <md-icon name="cancel_14"></md-icon>
          </md-button>
        </div>
      </div>
      <div class="visit-details-content">
        <table>
          <tr>
            <td class="title">
              Facility
            </td>
            <td class="value">
              ${visit.facility}
            </td>
          </tr>
          <tr>
            <td class="title">
              Clinician
            </td>
            <td class="value">
              ${visit.clinician}
            </td>
          </tr>
          <tr>
            <td class="title">
              Department
            </td>
            <td class="value">
              <span>${visit.department}</span>
            </td>
          </tr>
          <tr>
            <td class="title">
              Condition
            </td>
            <td class="value">
              <span>${visit.condition}</span>
            </td>
          </tr>
          <tr>
            <td class="title">
              Type
            </td>
            <td class="value">
              <span>${visit.type}</span>
            </td>
          </tr>
          <tr>
            <td class="title">
              O2 Stat
            </td>
            <td class="value">
              ${this.formatO2Stat(visit.O2Stat)}
            </td>
          </tr>
        </table>
      </div>
    `;
  };

  renderVisitBadge = (visit: CustomerVisit) => {
    const [bottom, left, formattedDate] = this.matrixPosition(visit.date);
    return html`
      <div
        class="wrapper"
        style="z-index: 100; position: absolute; bottom: ${bottom}px; left: ${left}%"
      >
        <md-menu-overlay>
          <div
            slot="menu-trigger"
            aria-haspopup="true"
            aria-expanded="true"
            @click=${this.toggleMenuOpen}
          >
            <md-tooltip message="${visit.title}" class="mock-badge">
              <span>
                <md-badge
                  circle
                  small
                  color=${this.VISITTYPES[this.visitType].color}
                  style="margin-right: .25rem"
                >
                  ${this.getVisitIcon()}
                </md-badge>
                ${visit.title}
              </span>

              <span class="split-separator"> | </span>
              <span>
                ${formattedDate}
              </span>
            </md-tooltip>
          </div>
          <div class="visit-overlay-content">
            ${this.visitDetailsOverlay(visit, formattedDate as string)}
          </div>
        </md-menu-overlay>
      </div>
    `;
  };

  static get styles() {
    return styles;
  }

  render() {
    return html`
      ${this.visit ? this.renderVisitBadge(this.visit) : nothing}
    `;
  }
}
