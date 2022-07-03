import * as Trial from './Trial';
import * as Micro from './Micro';
import * as Small from './Small';
import * as Medium from './Medium';
import * as PAYG from './PAYG';
import * as Free from './Free';
import * as PAYG2019 from './PAYG2019';
import * as Plans2019 from './Plans2019';

export default {
	trial: Trial,
	tier2_monthly: Micro,
	tier2_yearly: Micro,
	tier3_monthly: Small,
	tier3_yearly: Small,
	tier4_monthly: Medium,
	tier4_yearly: Medium,
	pay_as_you_go: PAYG,
	Free: Free,
	PAYG2019: PAYG2019,
	Plans2019: Plans2019,
};
